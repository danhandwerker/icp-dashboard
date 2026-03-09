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
        content: `Analyze the brand "${brandName}" for a Rokt Ads ICP (Ideal Customer Profile) assessment. Rokt is an ad-tech platform that shows performance ads during e-commerce transaction moments (confirmation pages, checkout flows). Advertisers need a clear, measurable digital conversion event and a compelling consumer offer.

IMPORTANT: Be CRITICAL and REALISTIC. Not every brand is a good fit for transaction-moment advertising. Assess this brand specifically for Rokt's model, not for general advertising potential.

Categories that are typically BAD fits (score them honestly):
- Grocery/supermarket chains: thin margins, geo constraints, habit switching
- Automotive OEMs: long purchase cycles, lead-gen only, no transaction-moment fit
- Luxury/premium brands: anti-performance DNA, exclusivity conflicts with mass-market ads
- B2B companies: wrong audience (Rokt reaches consumers, not business buyers)
- Pharma/prescription: FDA regulations, no online Rx purchase path
- Government/public sector: no ROI metrics, slow approval chains
- Brand awareness advertisers: no performance goal = no fit
- Real estate: long cycles, local, offline conversion

Return a JSON object with EXACTLY these fields (no markdown, no code fences, just raw JSON):

{
  "name": "Official brand name",
  "industry": "Primary industry - must be one of: Finance / Fintech, Streaming / Media, Food Delivery / Meal Kits / QSR, Online Retail / E-commerce, Insurance, Gaming / Betting, Travel / Hospitality, Nonprofit / Charity, Pet / Animal, Health / Beauty / Wellness, Subscription / DTC, Telecom, Automotive, Education, Grocery / Supermarket, Luxury / Premium, Real Estate / Home Services, Pharma / Prescription, B2B / Enterprise, Government / Public Sector, Brand Awareness Only, Other Consumer",
  "subIndustry": "More specific sub-vertical",
  "description": "One-sentence company description",
  "estimatedRevenue": "Estimated annual revenue range (e.g. '$1B-$5B', '$100M-$500M')",
  "estimatedEmployees": "Estimated employee count range",
  "digitalPresence": "Assessment of their digital/online presence and e-commerce activity (strong/moderate/limited)",
  "adTechStack": "What ad-tech, tracking, and measurement tools they likely use. Map to: S2S + CDP + strong CTL / S2S or CDP with good event coverage / Standard pixel + conversion tracking / Basic web analytics only / No tracking infrastructure",
  "conversionType": "What would they want users to do on Rokt? Be specific and realistic. If the brand doesn't have a clear digital conversion event, say so.",
  "conversionCycleLength": "How long from ad click to the advertiser's REAL KPI being achieved? Must be one of: Instant / same-session, Short (1-3 days), Medium (1-2 weeks), Long (2-4 weeks), Very long (30+ days). Consider the FULL funnel. Be honest — car purchases are 'Very long', insurance binding is 'Long', grocery delivery signup is 'Short'.",
  "offerPotential": "What kind of offer could they run on Rokt? Be specific. If the brand is unlikely to offer a strong promotion (luxury, B2B, government), say so honestly. Map to: Cash reward / Cashback, Free trial, Strong discount (>20% off), Introductory price, Free item, Moderate discount, Coupon/promo code, Sweepstakes, Weak/generic, No offer planned",
  "regulatoryEnvironment": "Any regulatory constraints? Map to: No regulatory constraints, Minor constraints (age gating), Moderate (financial/health disclosures), Heavy (gambling/pharma/cannabis)",
  "audienceType": "How broad is their target consumer base ON ROKT specifically? Consider that Rokt reaches consumers during e-commerce checkouts. B2B brands have 'B2B or very narrow' audience on Rokt regardless of their actual customer base size. Map to: Broad consumer mass market, Large but somewhat targeted, Niche consumer audience, B2B or very narrow",
  "existingAdChannels": "What advertising channels do they currently use?",
  "estimatedTestBudget": "How much would this brand realistically spend on a 90-day test of Rokt? Revenue >$10B AND heavy digital (Capital One, Disney) = $300k+. Revenue $1-10B with strong digital = $100-300k. Revenue $100M-$1B = $50-100k. Revenue $10-100M (DTC brands) = $20-50k. Revenue <$10M = <$20k. Must be one of: $300k+, $100-300k, $50-100k, $20-50k, <$20k. ERR CONSERVATIVE.",
  "measurementApproach": "How do they measure ad performance? Map to: Standard attribution open to Rokt reporting, Has internal tools but flexible, Rigid internal attribution, Known measurement friction",
  "website": "The brand's primary website domain (e.g. 'netflix.com'). Just the domain.",
  "confidence": "How confident are you? 'high' for well-known brands, 'medium' for mid-size, 'low' for obscure"
}

Be specific and grounded. If the brand is well-known, use your knowledge. If not, make reasonable inferences.`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content || "";

  try {
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
