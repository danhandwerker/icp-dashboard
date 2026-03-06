import OpenAI from "openai";
import { BrandEnrichment, Confidence } from "./types";

const client = new OpenAI();

export async function enrichBrand(brandName: string): Promise<BrandEnrichment> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Analyze the brand "${brandName}" for a Rokt Ads ICP (Ideal Customer Profile) assessment. Rokt is an ad-tech platform that shows ads during e-commerce transactions (confirmation pages, checkout flows). I need you to assess this brand as a potential Rokt Ads advertiser.

Return a JSON object with EXACTLY these fields (no markdown, no code fences, just raw JSON):

{
  "name": "Official brand name",
  "industry": "Primary industry - must be one of: Finance / Fintech, Streaming / Media, Food Delivery / Meal Kits / QSR, Retail / E-commerce, Insurance, Gaming / Betting, Travel / Hospitality, Nonprofit / Charity, Pet / Animal, Health / Beauty / Wellness, Subscription / DTC, Telecom, Automotive, Education, Other Consumer, B2B",
  "subIndustry": "More specific sub-vertical",
  "description": "One-sentence company description",
  "estimatedRevenue": "Estimated annual revenue range (e.g. '$1B-$5B', '$100M-$500M'). For budget scoring: >$1B means large ad budget potential, $100M-$1B means moderate, <$100M means smaller. Express as range.",
  "estimatedEmployees": "Estimated employee count range",
  "digitalPresence": "Assessment of their digital/online presence and e-commerce activity (strong/moderate/limited)",
  "adTechStack": "What ad-tech, tracking, and measurement tools they likely use. Mention specifics if known (e.g. 'Uses Google Analytics, likely has server-side tracking via S2S, uses MMPs like AppsFlyer'). Map to: S2S + CDP + strong CTL / S2S or CDP with good event coverage / Standard pixel + conversion tracking / Basic web analytics only / No tracking infrastructure",
  "conversionType": "What would they want users to do? (e.g. 'sign up for credit card', 'start free trial', 'make first purchase', 'download app')",
  "conversionCycleLength": "How long from ad click to the advertiser's real KPI being achieved? Must be one of: Instant / same-session (purchase/signup immediately), Short (1-3 days), Medium (1-2 weeks), Long (2-4 weeks), Very long (30+ days). Consider the FULL funnel including downstream events the advertiser cares about.",
  "offerPotential": "What kind of offer could they run on Rokt? Be specific (e.g. '3 months free trial', '$50 cashback on first purchase'). Map to: Cash reward / Cashback, Free trial, Strong discount (>20% off), Introductory price, Free item, Moderate discount, Coupon/promo code, Sweepstakes, Weak/generic, No offer planned",
  "regulatoryEnvironment": "Any regulatory constraints that would limit ad targeting or marketing? Map to: No regulatory constraints, Minor constraints (age gating), Moderate (financial/health disclosures), Heavy (gambling/pharma/cannabis)",
  "audienceType": "How broad is their target consumer base? Map to: Broad consumer mass market, Large but somewhat targeted, Niche consumer audience, B2B or very narrow",
  "existingAdChannels": "What advertising channels do they currently use? (Google, Meta, TV, programmatic, etc.)",
  "estimatedTestBudget": "How much would this brand realistically spend on a 90-day test of a NEW, unproven ad channel like Rokt? This is NOT their total ad budget — it's what they'd allocate to test one new channel. Based on REAL Rokt advertiser data: Revenue >$10B AND heavy digital spender (Capital One, Disney) = $300k+ with performance guarantee. Revenue $1-10B with strong digital (DoorDash, HelloFresh, E*TRADE) = $100-300k. Revenue $100M-$1B (Westpac, Fanatics Casino, most mid-size brands) = $50-100k. Revenue $10-100M (DTC brands like Sunday for Dogs, Halo Collar, PlayStar) = $20-50k. Revenue <$10M or pre-revenue = <$20k. Must be one of: $300k+, $100-300k, $50-100k, $20-50k, <$20k. ERR ON THE CONSERVATIVE SIDE — the typical new advertiser test is $20-100k. Only Fortune 500 heavy digital spenders commit $300k+.",
  "measurementApproach": "How do they likely measure ad performance? Map to: Standard attribution open to Rokt reporting, Has internal tools but flexible, Rigid internal attribution, Known measurement friction",
  "website": "The brand's primary website domain (e.g. 'netflix.com', 'halocollar.com'). Just the domain, no https://",
  "confidence": "How confident are you in this analysis? 'high' for well-known brands, 'medium' for mid-size brands, 'low' for obscure brands"
}

Be specific and grounded. If the brand is well-known, use your knowledge. If not, make reasonable inferences based on the industry and name.`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content || "";

  try {
    // Strip any markdown fences if present
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return {
      name: parsed.name || brandName,
      industry: parsed.industry || "Other Consumer",
      subIndustry: parsed.subIndustry || "",
      description: parsed.description || "",
      estimatedRevenue: parsed.estimatedRevenue || "Unknown",
      estimatedEmployees: parsed.estimatedEmployees || "Unknown",
      digitalPresence: parsed.digitalPresence || "Unknown",
      adTechStack: parsed.adTechStack || "Unknown",
      conversionType: parsed.conversionType || "Unknown",
      conversionCycleLength: parsed.conversionCycleLength || "Unknown",
      offerPotential: parsed.offerPotential || "Unknown",
      regulatoryEnvironment: parsed.regulatoryEnvironment || "Unknown",
      audienceType: parsed.audienceType || "Unknown",
      existingAdChannels: parsed.existingAdChannels || "Unknown",
      estimatedTestBudget: parsed.estimatedTestBudget || "Unknown",
      measurementApproach: parsed.measurementApproach || "Unknown",
      website: parsed.website || "",
      confidence: (parsed.confidence as Confidence) || "medium",
    };
  } catch {
    throw new Error(`Failed to parse brand enrichment for "${brandName}": ${text.slice(0, 200)}`);
  }
}
