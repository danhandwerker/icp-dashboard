import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";
import { DIMENSIONS } from "@/lib/scoring";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DIMENSION_PROMPTS: Record<string, (brand: string, context?: string) => string> = {
  offer: (brand, context) => `You are researching the promotional offer strategy for "${brand}" to assess their potential as an advertiser on Rokt Ads (a transaction-moment advertising platform).

Research what promotional offers ${brand} currently runs or has run. Look for: cashback, free trials, discounts, promo codes, sweepstakes, introductory pricing. What offer could they realistically bring to Rokt?

${context ? `Additional context: ${context}\n` : ""}
Based on your knowledge, respond with:
1. A brief summary of their likely offer approach (2-3 sentences)
2. The single best matching offer type from this list (pick the closest match):
   - "Cash reward / Cashback" (direct monetary incentive)
   - "Free trial (streaming/subscription)" (try free for X days)
   - "Strong discount (>20% off)" (meaningful percentage off)
   - "Introductory price" ($1/month for first 3 months, etc.)
   - "Free item / gift with purchase" (tangible bonus item)
   - "Moderate discount (10-20% off)" (standard promotional offer)
   - "Coupon / promo code" (code-based discount)
   - "Sweepstakes / contest entry" (chance to win)
   - "Weak / generic promotion" (vague value prop, no clear incentive)
   - "No offer planned" (brand awareness only, no incentive)

Respond ONLY as valid JSON with this exact shape:
{"label": "<exact label from list above>", "rationale": "<2-3 sentence summary>", "sources": "<what you based this on>"}`,

  budget: (brand, context) => `You are estimating the advertising budget potential for "${brand}" as an advertiser on Rokt Ads (a transaction-moment advertising platform where typical new advertiser test budgets range $20k–$300k for 30–90 days).

Research ${brand}'s advertising spend patterns. Consider: company revenue, known ad budgets, digital marketing sophistication, scale of operations, funding stage.

${context ? `Additional context: ${context}\n` : ""}
Based on your knowledge, respond with the single best matching budget tier from this list (pick the closest match):
- "$300k+ test with performance guarantee" (enterprise commitment)
- "$100-300k, 60+ day runway" (strong test budget)
- "$50-100k, 30-60 days" (solid mid-range test)
- "$20-50k, 30+ days" (typical small-mid test)
- "<$20k or <30 days" (very small test, limited runway)

Respond ONLY as valid JSON with this exact shape:
{"label": "<exact label from list above>", "rationale": "<2-3 sentence summary of their scale and spending patterns>", "sources": "<what you based this on>"}`,

  data_integration: (brand, context) => `You are assessing the ad-tech and data infrastructure of "${brand}" to evaluate their readiness to integrate with Rokt Ads (which requires conversion event tracking for optimization).

Research ${brand}'s tracking maturity. Look for: CDP usage (Segment, mParticle, Lytics), server-to-server (S2S) capabilities, pixel implementations, known measurement tools, mobile measurement partners (Adjust, AppsFlyer), clean room usage, data warehouse signals.

${context ? `Additional context: ${context}\n` : ""}
Based on your knowledge, respond with the single best matching tier from this list (pick the closest match):
- "S2S + CDP + strong CTL" (best-in-class measurement infrastructure)
- "S2S or CDP with good event coverage" (strong server-side tracking)
- "Standard pixel + conversion tracking" (basic but functional tracking)
- "Basic web analytics only" (GA only, no server-side)
- "No tracking infrastructure" (would need to build from scratch)

Respond ONLY as valid JSON with this exact shape:
{"label": "<exact label from list above>", "rationale": "<2-3 sentence summary of their data infrastructure>", "sources": "<what you based this on>"}`,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { brand, dimensionId, brandContext } = body as {
      brand: string;
      dimensionId: string;
      brandContext?: string;
    };

    if (!brand || typeof brand !== "string" || brand.trim().length === 0) {
      return NextResponse.json({ error: "brand is required" }, { status: 400 });
    }
    if (!dimensionId || typeof dimensionId !== "string") {
      return NextResponse.json({ error: "dimensionId is required" }, { status: 400 });
    }

    const promptFn = DIMENSION_PROMPTS[dimensionId];
    if (!promptFn) {
      return NextResponse.json(
        { error: `No research prompt available for dimension: ${dimensionId}` },
        { status: 400 }
      );
    }

    const dimension = DIMENSIONS.find((d) => d.id === dimensionId);
    if (!dimension) {
      return NextResponse.json({ error: "Unknown dimension" }, { status: 400 });
    }

    const prompt = promptFn(brand.trim(), brandContext);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: { label?: string; rationale?: string; sources?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    const { label, rationale, sources } = parsed;
    if (!label) {
      return NextResponse.json({ error: "AI did not return a label" }, { status: 500 });
    }

    // Find the closest matching option in the dimension
    const exactMatch = dimension.options.find(
      (o) => o.label.toLowerCase() === label.toLowerCase()
    );

    // Fuzzy fallback: find option whose label contains the most words from the AI label
    const fuzzyMatch = exactMatch ?? (() => {
      const labelLower = label.toLowerCase();
      let best = dimension.options[dimension.options.length - 1];
      let bestScore = -1;
      for (const opt of dimension.options) {
        const optLower = opt.label.toLowerCase();
        // Check both directions: option words in label, label words in option
        const words = optLower.split(/\s+/);
        let score = 0;
        for (const w of words) {
          if (w.length > 3 && labelLower.includes(w)) score++;
        }
        if (score > bestScore) {
          bestScore = score;
          best = opt;
        }
      }
      return best;
    })();

    return NextResponse.json({
      score: fuzzyMatch.value,
      label: fuzzyMatch.label,
      rationale: rationale ?? `Researched based on known information about ${brand}.`,
      sources: sources ?? "AI research based on publicly available information",
    });
  } catch (error) {
    console.error("Research dimension error:", error);
    return NextResponse.json({ error: "Failed to research dimension" }, { status: 500 });
  }
}
