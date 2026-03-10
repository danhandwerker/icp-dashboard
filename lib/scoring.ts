import {
  DimensionScore,
  DimensionOption,
  Grade,
  ChurnRisk,
  RedFlag,
  Recommendation,
  Comparable,
  BrandEnrichment,
  ScoreResult,
  RoktAdvertiserData,
} from "./types";

// ─── Dimension Definitions ───────────────────────────────────────────────────

interface DimensionDef {
  id: string;
  name: string;
  maxScore: number;
  description: string;
  options: DimensionOption[];
  optional?: boolean;
}

export const DIMENSIONS: DimensionDef[] = [
  {
    id: "industry",
    name: "Industry Fit",
    maxScore: 32,
    description:
      "How well the brand's vertical maps to Rokt's proven top-performing advertiser categories. Transaction-moment advertising works best for performance-oriented consumer brands with clear digital conversion events.",
    options: [
      { label: "Finance / Fintech", value: 32, description: "Credit cards, banking, payments, lending (Capital One, PayPal)" },
      { label: "Streaming / Media", value: 29, description: "Video, music, podcasts, news subscriptions (Disney+, Apple TV+)" },
      { label: "Food Delivery / Meal Kits / QSR", value: 27, description: "DoorDash, HelloFresh, restaurant chains" },
      { label: "Gaming / Betting", value: 28, description: "Online gaming, sports betting, casino (BetMGM, DraftKings, bet365)" },
      { label: "Online Retail / E-commerce", value: 27, description: "Online & omnichannel retailers with digital checkout (Sam's Club, BJ's)" },
      { label: "Pet / Animal", value: 26, description: "Pet food, pet health, pet products (Farmer's Dog, BarkBox, Chewy)" },
      { label: "Insurance", value: 24, description: "Auto, home, pet, health insurance (Super, Asurifi)" },
      { label: "Subscription / DTC", value: 24, description: "D2C subscription boxes, consumer apps, membership products" },
      { label: "Nonprofit / Charity", value: 22, description: "Charitable organizations, fundraising (ASPCA, St. Jude)" },
      { label: "Travel / Hospitality", value: 20, description: "Airlines, hotels, OTAs, vacation rentals (Booking.com)" },
      { label: "Health / Beauty / Wellness", value: 18, description: "DTC beauty, telehealth, fitness, skincare" },
      { label: "Telecom", value: 16, description: "Mobile carriers, internet providers (Mint Mobile)" },
      { label: "Education", value: 12, description: "EdTech, online learning — longer consideration cycles" },
      { label: "Grocery / Supermarket", value: 10, description: "Thin margins, geo constraints, habit switching, limited digital conversion" },
      { label: "Other Consumer", value: 8, description: "Consumer brands not fitting other categories" },
      { label: "Automotive", value: 8, description: "Long purchase cycle, lead-gen only, delayed attribution, no transaction-moment fit" },
      { label: "Luxury / Premium", value: 6, description: "Anti-performance DNA, exclusivity conflicts, high-friction conversion" },
      { label: "Real Estate / Home Services", value: 5, description: "Long cycle, local, low frequency, offline conversion" },
      { label: "Pharma / Prescription", value: 3, description: "FDA fair-balance requirements, no online Rx path, HIPAA constraints" },
      { label: "B2B / Enterprise", value: 3, description: "Wrong audience — e-commerce shoppers are consumers, not business buyers" },
      { label: "Government / Public Sector", value: 3, description: "No ROI metric, slow approval chains, no outcome-based pricing fit" },
      { label: "Brand Awareness Only", value: 0, description: "No performance goal — fundamentally misaligned with Rokt Ads" },
    ],
  },
  {
    id: "offer",
    name: "Offer Strength",
    maxScore: 15,
    optional: true,
    description:
      "The quality and type of offer the brand can present. RoktGPT identifies offer strength as the single biggest lever for advertiser success. Leave blank until known.",
    options: [
      { label: "Cash reward / Cashback", value: 15, description: "Direct monetary incentive ($X back)" },
      { label: "Free trial (streaming/subscription)", value: 14, description: "Try free for X days/months" },
      { label: "Strong discount (>20% off)", value: 12, description: "Meaningful percentage off" },
      { label: "Introductory price", value: 11, description: "$1/month for first 3 months, etc." },
      { label: "Free item / gift with purchase", value: 10, description: "Tangible bonus item" },
      { label: "Moderate discount (10-20% off)", value: 9, description: "Standard promotional offer" },
      { label: "Coupon / promo code", value: 8, description: "Code-based discount" },
      { label: "Sweepstakes / contest entry", value: 6, description: "Chance to win" },
      { label: "Weak / generic promotion", value: 4, description: "Vague value prop, no clear incentive" },
      { label: "No offer planned", value: 2, description: "Brand awareness only, no incentive" },
    ],
  },
  {
    id: "conversion_cycle",
    name: "Conversion Cycle",
    maxScore: 10,
    description:
      "How quickly the end consumer converts after engaging. Short cycles strongly predict retention: 15 conversions by Day 4 = 38% lower churn.",
    options: [
      { label: "Instant / same-session", value: 10, description: "Click -> purchase/signup immediately" },
      { label: "Short (1-3 days)", value: 8, description: "App download -> first use, quick signup" },
      { label: "Medium (1-2 weeks)", value: 5, description: "Free trial -> subscribe, considered purchase" },
      { label: "Long (2-4 weeks)", value: 3, description: "Insurance quote -> bind, account approval" },
      { label: "Very long (30+ days)", value: 1, description: "First deposit, policy activation, enterprise" },
    ],
  },
  {
    id: "budget",
    name: "Budget & Scale",
    maxScore: 12,
    optional: true,
    description:
      "Sufficient budget and realistic targets for Rokt's learning phase. Typical new advertiser tests range $20-100k. Unrealistic CPA/ROAS targets cause 34% of all churn. Leave blank until known.",
    options: [
      { label: "$300k+ test with performance guarantee", value: 12, description: "Enterprise commitment (Farmer's Dog, E*TRADE pattern)" },
      { label: "$100-300k, 60+ day runway", value: 10, description: "Strong test budget, room for smart bidding to learn" },
      { label: "$50-100k, 30-60 days", value: 8, description: "Solid mid-range test (Westpac, Fanatics pattern)" },
      { label: "$20-50k, 30+ days", value: 5, description: "Typical small-mid test (Disney MX, PlayStar pattern)" },
      { label: "<$20k or <30 days", value: 2, description: "Very small test, limited learning window" },
    ],
  },
  {
    id: "data_integration",
    name: "Data & Integration Readiness",
    maxScore: 12,
    optional: true,
    description:
      "Tracking maturity and close-the-loop (CTL) capability. Poor CTL blocks downstream optimization — the root cause of 46% of regrettable churn. Leave blank until known.",
    options: [
      { label: "S2S + CDP + strong CTL", value: 12, description: "Best-in-class measurement infrastructure" },
      { label: "S2S or CDP with good event coverage", value: 10, description: "Strong server-side tracking" },
      { label: "Standard pixel + conversion tracking", value: 7, description: "Basic but functional tracking" },
      { label: "Basic web analytics only", value: 3, description: "GA only, no server-side" },
      { label: "No tracking infrastructure", value: 0, description: "Would need to build from scratch" },
    ],
  },
  {
    id: "measurement",
    name: "Measurement Alignment",
    maxScore: 6,
    description:
      "Whether the brand's attribution approach will align with Rokt's. The SoFi pattern: internal measurement tools that disagree with Rokt erode trust and cause churn.",
    options: [
      { label: "Standard attribution, open to Rokt reporting", value: 6, description: "GA, MMPs, will trust Rokt data" },
      { label: "Has internal tools but flexible", value: 4, description: "Own system but willing to reconcile" },
      { label: "Rigid internal attribution", value: 2, description: "Proprietary system, may conflict" },
      { label: "Known measurement friction", value: 0, description: "Won't trust external measurement" },
    ],
  },
  {
    id: "audience_supply",
    name: "Audience & Supply Fit",
    maxScore: 8,
    description:
      "Whether there is sufficient Rokt inventory for this brand's target audience. Limited auction exposure compounds all other churn factors.",
    options: [
      { label: "Broad consumer, mass market", value: 8, description: "Appeals to wide Rokt audience" },
      { label: "Large but somewhat targeted", value: 6, description: "Specific demo but still large reach" },
      { label: "Niche consumer audience", value: 3, description: "Narrow targeting requirements" },
      { label: "B2B or very narrow", value: 0, description: "Limited match to Rokt supply" },
    ],
  },
  {
    id: "regulatory",
    name: "Regulatory Environment",
    maxScore: 5,
    description:
      "Regulatory constraints that limit the use of Rokt's audience and optimization tools. Mistplay and Phia churned due to industry regulations blocking advanced targeting.",
    options: [
      { label: "No regulatory constraints", value: 5, description: "Standard consumer marketing" },
      { label: "Minor constraints (age gating)", value: 3, description: "Age verification, minor disclosures" },
      { label: "Moderate (financial, health disclosures)", value: 2, description: "Required disclaimers but can target" },
      { label: "Heavy (gambling, pharma, cannabis)", value: 0, description: "Significant targeting limitations" },
    ],
  },
];

// ─── Scoring Logic ───────────────────────────────────────────────────────────

/** Sum scores for active dimensions only */
export function computeScore(dimensions: DimensionScore[]): number {
  return dimensions
    .filter((d) => !d.optional || d.active)
    .reduce((sum, d) => sum + d.score, 0);
}

/** Sum maxScore for active dimensions only (dynamic denominator) */
export function computeMaxPossible(dimensions: DimensionScore[]): number {
  return dimensions
    .filter((d) => !d.optional || d.active)
    .reduce((sum, d) => sum + d.maxScore, 0);
}

/** Score as percentage of dynamic denominator */
export function computeScorePercent(dimensions: DimensionScore[]): number {
  const max = computeMaxPossible(dimensions);
  if (max === 0) return 0;
  return Math.round((computeScore(dimensions) / max) * 100);
}

/** Grade based on percentage of dynamic denominator */
export function getGrade(scoreOrPercent: number, dimensions?: DimensionScore[]): Grade {
  const pct = dimensions ? computeScorePercent(dimensions) : scoreOrPercent;
  if (pct >= 85) return "A";
  if (pct >= 70) return "B";
  if (pct >= 55) return "C";
  if (pct >= 40) return "D";
  return "F";
}

export function getChurnRisk(
  _score: number,
  dimensions: DimensionScore[]
): { risk: ChurnRisk; detail: string } {
  const convCycle = dimensions.find((d) => d.id === "conversion_cycle");
  const dataInt = dimensions.find((d) => d.id === "data_integration");
  const measurement = dimensions.find((d) => d.id === "measurement");
  const budget = dimensions.find((d) => d.id === "budget");

  // Specific high-risk patterns from churn report
  if (
    convCycle &&
    convCycle.score <= 3 &&
    dataInt &&
    dataInt.active &&
    dataInt.score <= 7
  ) {
    return {
      risk: "high",
      detail:
        "Long conversion cycle + weak CTL integration: matches the pattern causing 46% of regrettable churn. Downstream events will be hard to optimize without robust close-the-loop signal.",
    };
  }

  if (
    measurement &&
    measurement.score <= 2 &&
    budget &&
    budget.active &&
    budget.score <= 5
  ) {
    return {
      risk: "high",
      detail:
        "Rigid internal attribution + limited budget: SoFi pattern detected. Measurement misalignment erodes trust before the channel can prove value.",
    };
  }

  const pct = computeScorePercent(dimensions);

  if (pct >= 75) {
    return {
      risk: "low",
      detail:
        "Strong overall fit. Advertisers scoring 75%+ retain at 96% past Day 90 when early conversion traction is achieved.",
    };
  }
  if (pct >= 55) {
    return {
      risk: "medium",
      detail:
        "Moderate fit with addressable gaps. Watch for early conversion traction — Day 4 checkpoint (15+ conversions) is critical for retention.",
    };
  }
  return {
    risk: "high",
    detail:
      "Significant fit gaps. 52%+ of advertisers in this range churn before Day 90. Address red flags before launch.",
  };
}

// ─── Red Flags ───────────────────────────────────────────────────────────────

export function detectRedFlags(dimensions: DimensionScore[]): RedFlag[] {
  const flags: RedFlag[] = [];
  const get = (id: string) => dimensions.find((d) => d.id === id);

  const convCycle = get("conversion_cycle");
  const dataInt = get("data_integration");
  const measurement = get("measurement");
  const budget = get("budget");
  const offer = get("offer");
  const audience = get("audience_supply");
  const regulatory = get("regulatory");
  const industry = get("industry");

  if (convCycle && convCycle.score <= 3 && dataInt && dataInt.active && dataInt.score <= 7) {
    flags.push({
      title: "Downstream Optimization Trap",
      description:
        "Long conversion cycle paired with limited CTL. The advertiser's real KPI (first deposit, policy bind, etc.) will be hard to optimize toward. This pattern caused 46% of regrettable churn.",
      pattern: "Fetch Pet Insurance, Payward pattern",
      severity: "critical",
    });
  }

  if (measurement && measurement.score <= 2 && budget && budget.active && budget.score <= 8) {
    flags.push({
      title: "Measurement Misalignment Risk",
      description:
        "Rigid internal attribution may conflict with Rokt reporting, eroding trust before the channel proves value. SoFi spent 6+ weeks before hitting first success due to this pattern.",
      pattern: "SoFi pattern",
      severity: "critical",
    });
  }

  if (offer && offer.active && offer.score <= 4) {
    flags.push({
      title: "Weak Offer",
      description:
        "Offer strength is the single biggest lever for Rokt Ads success. WSJ churned when running anything other than their $1/week offer. Without a compelling offer, engagement and conversion rates suffer.",
      pattern: "WSJ pattern",
      severity: "critical",
    });
  }

  if (budget && budget.active && budget.score <= 2) {
    flags.push({
      title: "Insufficient Learning Budget",
      description:
        "Budget below $20k or runway under 30 days. Rokt's learning phase needs time to stabilize smart bidding. Churned advertisers miss CPA targets by 177% vs 47% for retained advertisers.",
      pattern: "Cold-start efficiency spiral",
      severity: "critical",
    });
  }

  if (audience && audience.score <= 3) {
    flags.push({
      title: "Limited Supply Fit",
      description:
        "Narrow or B2B audience limits auction exposure. Churned advertisers participated in far fewer auctions — limited supply compounds all other performance issues.",
      pattern: "Shutterfly B2B pattern",
      severity: "warning",
    });
  }

  if (regulatory && regulatory.score <= 0) {
    flags.push({
      title: "Regulatory Targeting Constraints",
      description:
        "Heavy regulations limit use of Rokt's advanced audience and optimization tools, constraining scale potential.",
      pattern: "Mistplay / Phia pattern",
      severity: "warning",
    });
  }

  if (industry && industry.score <= 8) {
    flags.push({
      title: "Poor Industry Fit",
      description:
        "This vertical has fundamental structural challenges for transaction-moment advertising: long purchase cycles, no digital conversion path, wrong audience, or misaligned business model.",
      pattern: "Structural misalignment",
      severity: "critical",
    });
  }

  return flags;
}

// ─── Spend Projection ────────────────────────────────────────────────────────

export function predictSpend(scoreOrPercent: number, dimensions?: DimensionScore[]): {
  low: number;
  mid: number;
  high: number;
} {
  const pct = dimensions ? computeScorePercent(dimensions) : scoreOrPercent;
  if (pct >= 85) return { low: 3_000_000, mid: 10_000_000, high: 40_000_000 };
  if (pct >= 75) return { low: 1_000_000, mid: 5_000_000, high: 15_000_000 };
  if (pct >= 65) return { low: 300_000, mid: 1_500_000, high: 5_000_000 };
  if (pct >= 55) return { low: 100_000, mid: 500_000, high: 2_000_000 };
  if (pct >= 45) return { low: 25_000, mid: 150_000, high: 500_000 };
  if (pct >= 35) return { low: 10_000, mid: 50_000, high: 150_000 };
  return { low: 0, mid: 15_000, high: 50_000 };
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export function generateRecommendations(
  dimensions: DimensionScore[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  const currentPct = computeScorePercent(dimensions);

  for (const dim of dimensions) {
    // Skip inactive optional dimensions
    if (dim.optional && !dim.active) continue;
    if (dim.score >= dim.maxScore) continue;

    const sortedOptions = [...dim.options].sort((a, b) => b.value - a.value);
    const currentIdx = sortedOptions.findIndex(
      (o) => o.value === dim.score
    );
    const betterOption = currentIdx > 0 ? sortedOptions[currentIdx - 1] : null;

    if (!betterOption) continue;

    // Simulate the score change
    const newDimensions = dimensions.map((d) =>
      d.id === dim.id ? { ...d, score: betterOption.value } : d
    );
    const newPct = computeScorePercent(newDimensions);
    const currentGrade = getGrade(currentPct);
    const newGrade = getGrade(newPct);
    const currentSpend = predictSpend(currentPct);
    const newSpend = predictSpend(newPct);

    recs.push({
      dimension: dim.name,
      currentScore: dim.score,
      potentialScore: betterOption.value,
      action: `Upgrade to "${betterOption.label}"${betterOption.description ? `: ${betterOption.description}` : ""}`,
      impact: `Score: ${currentPct}% -> ${newPct}% (${currentGrade} -> ${newGrade})`,
      spendImpact:
        newSpend.mid > currentSpend.mid
          ? `Predicted spend: $${fmtM(currentSpend.mid)} -> $${fmtM(newSpend.mid)}`
          : "No change to predicted spend range",
    });
  }

  recs.sort(
    (a, b) =>
      b.potentialScore - b.currentScore - (a.potentialScore - a.currentScore)
  );

  return recs;
}

function fmtM(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

// ─── Comparables ─────────────────────────────────────────────────────────────

const COMPARABLE_DB: {
  industry: string;
  brands: Comparable[];
}[] = [
  {
    industry: "Finance / Fintech",
    brands: [
      { name: "Capital One", industry: "Finance", outcome: "Top spender on Rokt ($185M+), strong growth", similarity: "Credit card / banking", domain: "capitalone.com" },
      { name: "Discover", industry: "Finance", outcome: "Active advertiser, steady spend", similarity: "Credit cards", domain: "discover.com" },
      { name: "PayPal", industry: "Fintech", outcome: "5x growth H2 over H1, fast-scaling", similarity: "Payments / digital wallet", domain: "paypal.com" },
    ],
  },
  {
    industry: "Streaming / Media",
    brands: [
      { name: "Disney+", industry: "Streaming", outcome: "2.3x growth, $40M spend", similarity: "Video streaming subscription", domain: "disneyplus.com" },
      { name: "Apple TV+", industry: "Streaming", outcome: "3.5x growth, rapidly scaling", similarity: "Streaming service", domain: "apple.com" },
      { name: "Starz", industry: "Streaming", outcome: "Active at $16M, steady", similarity: "Premium streaming", domain: "starz.com" },
    ],
  },
  {
    industry: "Food Delivery / Meal Kits / QSR",
    brands: [
      { name: "HelloFresh", industry: "Meal Kits", outcome: "Multi-market presence ($39M total across accounts)", similarity: "Meal kit subscription", domain: "hellofresh.com" },
      { name: "DoorDash", industry: "Food Delivery", outcome: "Active and growing, app-focused", similarity: "Food delivery", domain: "doordash.com" },
      { name: "Grubhub", industry: "Food Delivery", outcome: "High conversion rate (43%)", similarity: "Food delivery", domain: "grubhub.com" },
    ],
  },
  {
    industry: "Online Retail / E-commerce",
    brands: [
      { name: "Sam's Club", industry: "Retail", outcome: "2.6x growth, $18M spend", similarity: "Membership retail", domain: "samsclub.com" },
      { name: "BJ's Wholesale", industry: "Retail", outcome: "Steady performer at $7.7M", similarity: "Warehouse club", domain: "bjs.com" },
      { name: "Walmart", industry: "Retail", outcome: "Active advertiser", similarity: "Mass retail", domain: "walmart.com" },
    ],
  },
  {
    industry: "Insurance",
    brands: [
      { name: "Super", industry: "Insurance", outcome: "2x growth to $18M", similarity: "Insurance marketplace", domain: "hellosuper.com" },
      { name: "Asurifi", industry: "Insurance", outcome: "Fast growth, $11M", similarity: "Insurance services", domain: "asurifi.com" },
    ],
  },
  {
    industry: "Gaming / Betting",
    brands: [
      { name: "BetMGM", industry: "Betting", outcome: "Active at $9M, steady", similarity: "Sports betting / casino", domain: "betmgm.com" },
      { name: "Crown Gaming", industry: "Gaming", outcome: "Multi-account presence", similarity: "Online gaming", domain: "crowncasino.com.au" },
    ],
  },
  {
    industry: "Travel / Hospitality",
    brands: [
      { name: "Booking.com", industry: "Travel", outcome: "Active at $6M, high ROAS (15x)", similarity: "OTA", domain: "booking.com" },
      { name: "Hilton Grand Vacations", industry: "Travel", outcome: "High-value conversions", similarity: "Hospitality / timeshare", domain: "hiltongrandvacations.com" },
    ],
  },
  {
    industry: "Nonprofit / Charity",
    brands: [
      { name: "ASPCA", industry: "Nonprofit", outcome: "Major spender ($33M), strong CTR", similarity: "Animal welfare charity", domain: "aspca.org" },
      { name: "St. Jude", industry: "Nonprofit", outcome: "High conversion rate (17.6%)", similarity: "Healthcare charity", domain: "stjude.org" },
    ],
  },
  {
    industry: "Health / Beauty / Wellness",
    brands: [
      { name: "LaserAway", industry: "Beauty", outcome: "Active at $4.2M", similarity: "Aesthetics / beauty services", domain: "laseraway.com" },
      { name: "Factor 75", industry: "Health/Meal", outcome: "Steady at $9.2M", similarity: "Prepared meals / health", domain: "factor75.com" },
    ],
  },
  {
    industry: "Subscription / DTC",
    brands: [
      { name: "BarkBox", industry: "Subscription", outcome: "Strong DTC subscription, app-driven", similarity: "D2C subscription box", domain: "barkbox.com" },
      { name: "FabFitFun", industry: "Subscription", outcome: "Seasonal subscription, mass-market appeal", similarity: "D2C subscription box", domain: "fabfitfun.com" },
      { name: "Dollar Shave Club", industry: "Subscription", outcome: "DTC pioneer, strong offer-driven acquisition", similarity: "D2C subscription", domain: "dollarshaveclub.com" },
    ],
  },
  {
    industry: "Automotive",
    brands: [
      { name: "Carvana", industry: "Automotive", outcome: "Active advertiser, digital-first car buying", similarity: "Online automotive marketplace", domain: "carvana.com" },
      { name: "AutoTrader", industry: "Automotive", outcome: "High-volume lead generation", similarity: "Automotive marketplace", domain: "autotrader.com" },
    ],
  },
  {
    industry: "Education",
    brands: [
      { name: "Coursera", industry: "Education", outcome: "Subscription-based learning", similarity: "Online education platform", domain: "coursera.org" },
      { name: "MasterClass", industry: "Education", outcome: "Premium content subscription", similarity: "Subscription education", domain: "masterclass.com" },
    ],
  },
  {
    industry: "Telecom",
    brands: [
      { name: "Mint Mobile", industry: "Telecom", outcome: "DTC mobile carrier, strong promotions", similarity: "Budget mobile carrier", domain: "mintmobile.com" },
      { name: "Visible", industry: "Telecom", outcome: "Digital-first carrier by Verizon", similarity: "DTC telecom", domain: "visible.com" },
    ],
  },
  {
    industry: "Pet / Animal",
    brands: [
      { name: "BarkBox", industry: "Pet", outcome: "Leading pet subscription, strong DTC growth", similarity: "D2C pet products", domain: "barkbox.com" },
      { name: "Chewy", industry: "Pet", outcome: "Major pet e-commerce, high repeat purchase", similarity: "Pet e-commerce", domain: "chewy.com" },
      { name: "Farmer's Dog", industry: "Pet", outcome: "DTC fresh pet food, subscription model", similarity: "D2C pet subscription", domain: "thefarmersdog.com" },
    ],
  },
];

export function findComparables(enrichment: BrandEnrichment): Comparable[] {
  const industryLower = enrichment.industry.toLowerCase();
  const descLower = (enrichment.description || "").toLowerCase();
  const subIndustryLower = (enrichment.subIndustry || "").toLowerCase();
  const allText = `${industryLower} ${descLower} ${subIndustryLower}`;

  // First: exact industry match
  const exactMatch = COMPARABLE_DB.find((entry) =>
    industryLower.includes(entry.industry.split(" / ")[0].toLowerCase()) ||
    entry.industry.toLowerCase().includes(industryLower.split(" / ")[0].toLowerCase())
  );
  if (exactMatch) return exactMatch.brands;

  // Second: keyword matching across description and sub-industry
  const keywords: Record<string, string> = {
    "Pet / Animal": "pet dog cat animal collar leash treat food bark",
    "Food Delivery / Meal Kits / QSR": "food meal delivery restaurant kitchen cook",
    "Streaming / Media": "stream video music podcast media content",
    "Finance / Fintech": "bank credit card payment lending loan finance fintech",
    "Online Retail / E-commerce": "shop store retail ecommerce buy purchase merchandise",
    "Insurance": "insurance coverage policy claim underwriting",
    "Gaming / Betting": "game gaming bet casino esport",
    "Travel / Hospitality": "travel hotel flight airline booking vacation",
    "Nonprofit / Charity": "nonprofit charity donation donate cause",
    "Health / Beauty / Wellness": "health beauty wellness skincare fitness supplement",
    "Subscription / DTC": "subscription box subscribe membership saas app dtc direct consumer",
    "Automotive": "car auto vehicle drive motor",
    "Education": "learn course education school training",
    "Telecom": "mobile carrier phone wireless telecom cellular",
  };

  let bestIndustry = "";
  let bestKeywordScore = 0;

  for (const [industry, kws] of Object.entries(keywords)) {
    const kwList = kws.split(" ");
    let score = 0;
    for (const kw of kwList) {
      if (allText.includes(kw)) score++;
    }
    if (score > bestKeywordScore) {
      bestKeywordScore = score;
      bestIndustry = industry;
    }
  }

  if (bestKeywordScore > 0) {
    const match = COMPARABLE_DB.find((entry) => entry.industry === bestIndustry);
    if (match) return match.brands;
  }

  // Final fallback
  return [
    { name: "Dollar Shave Club", industry: "D2C", outcome: "DTC pioneer, offer-driven acquisition", similarity: "Direct-to-consumer brand", domain: "dollarshaveclub.com" },
    { name: "Chewy", industry: "E-commerce", outcome: "Major DTC e-commerce, high retention", similarity: "Consumer e-commerce", domain: "chewy.com" },
    { name: "FabFitFun", industry: "Subscription", outcome: "Seasonal subscription, mass-market", similarity: "D2C subscription", domain: "fabfitfun.com" },
  ];
}

// ─── Full Score Builder ──────────────────────────────────────────────────────

export function buildScoreFromEnrichment(
  enrichment: BrandEnrichment,
  roktData?: RoktAdvertiserData
): ScoreResult {
  let dimensions = mapEnrichmentToDimensions(enrichment);

  // Apply Rokt data-sourced dimension suggestions when available
  if (roktData?.found && roktData.suggestedDimensions) {
    const { budget, offer } = roktData.suggestedDimensions;
    dimensions = dimensions.map((dim) => {
      if (dim.id === "budget" && budget) {
        return {
          ...dim,
          score: budget.score,
          selectedOption: budget.label,
          rationale: budget.rationale,
          active: true,
          source: "crm" as const,
        };
      }
      if (dim.id === "offer" && offer) {
        return {
          ...dim,
          score: offer.score,
          selectedOption: offer.label,
          rationale: offer.rationale,
          active: true,
          source: "crm" as const,
        };
      }
      return dim.optional ? dim : { ...dim, source: "ai" as const };
    });
  } else {
    dimensions = dimensions.map((dim) =>
      dim.optional ? dim : { ...dim, source: "ai" as const }
    );
  }
  const totalScore = computeScore(dimensions);
  const maxPossibleScore = computeMaxPossible(dimensions);
  const scorePercent = computeScorePercent(dimensions);
  const grade = getGrade(scorePercent);
  const { risk: churnRisk, detail: churnRiskDetail } = getChurnRisk(
    totalScore,
    dimensions
  );
  const predictedAnnualSpend = predictSpend(scorePercent);
  const redFlags = detectRedFlags(dimensions);
  const recommendations = generateRecommendations(dimensions);
  const comparables = findComparables(enrichment);
  const meetingBrief = generateMeetingBrief(
    enrichment,
    scorePercent,
    grade,
    churnRisk,
    dimensions,
    redFlags,
    comparables
  );

  return {
    brand: enrichment.name,
    totalScore,
    maxPossibleScore,
    scorePercent,
    grade,
    churnRisk,
    churnRiskDetail,
    confidence: enrichment.confidence,
    predictedAnnualSpend,
    dimensions,
    redFlags,
    recommendations,
    comparables,
    enrichment,
    meetingBrief,
    scoredAt: new Date().toISOString(),
    roktData,
  };
}

function mapEnrichmentToDimensions(
  enrichment: BrandEnrichment
): DimensionScore[] {
  return DIMENSIONS.map((dim) => {
    // Optional dimensions start inactive (blank)
    if (dim.optional) {
      return {
        id: dim.id,
        name: dim.name,
        score: 0,
        maxScore: dim.maxScore,
        rationale: "Not yet assessed — select a value to include in scoring",
        selectedOption: "",
        options: dim.options,
        optional: true,
        active: false,
      };
    }

    const { score, selectedOption, rationale } = matchEnrichmentToDimension(
      dim,
      enrichment
    );
    return {
      id: dim.id,
      name: dim.name,
      score,
      maxScore: dim.maxScore,
      rationale,
      selectedOption,
      options: dim.options,
      optional: false,
      active: true,
    };
  });
}

function matchEnrichmentToDimension(
  dim: DimensionDef,
  enrichment: BrandEnrichment
): { score: number; selectedOption: string; rationale: string } {
  const fieldMap: Record<string, string> = {
    industry: enrichment.industry,
    offer: enrichment.offerPotential,
    conversion_cycle: enrichment.conversionCycleLength,
    budget: enrichment.estimatedTestBudget,
    data_integration: enrichment.adTechStack,
    measurement: enrichment.measurementApproach,
    audience_supply: enrichment.audienceType,
    regulatory: enrichment.regulatoryEnvironment,
  };

  const fieldValue = (fieldMap[dim.id] || "").toLowerCase();

  let bestMatch = dim.options[dim.options.length - 1]; // default to lowest
  let bestScore = -1;

  for (const option of dim.options) {
    const optionText =
      `${option.label} ${option.description || ""}`.toLowerCase();
    const words = optionText.split(/\s+/);
    let matchCount = 0;
    for (const word of words) {
      if (word.length > 3 && fieldValue.includes(word)) matchCount++;
    }
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestMatch = option;
    }
  }

  return {
    score: bestMatch.value,
    selectedOption: bestMatch.label,
    rationale: `Based on: "${fieldMap[dim.id] || "Unknown"}"`,
  };
}

// ─── Meeting Brief ───────────────────────────────────────────────────────────

function generateMeetingBrief(
  enrichment: BrandEnrichment,
  scorePercent: number,
  grade: Grade,
  churnRisk: ChurnRisk,
  dimensions: DimensionScore[],
  redFlags: RedFlag[],
  comparables: Comparable[]
): string {
  const lines: string[] = [];
  const activeDims = dimensions.filter((d) => !d.optional || d.active);
  const maxPossible = computeMaxPossible(dimensions);

  lines.push(`# Meeting Brief: ${enrichment.name}`);
  lines.push(`**ICP Score: ${scorePercent}% (${computeScore(dimensions)}/${maxPossible}) | Grade: ${grade} | Churn Risk: ${churnRisk.toUpperCase()}**\n`);

  lines.push(`## Company Overview`);
  lines.push(`- Industry: ${enrichment.industry} / ${enrichment.subIndustry}`);
  lines.push(`- ${enrichment.description}`);
  lines.push(`- Est. Revenue: ${enrichment.estimatedRevenue}`);
  lines.push(`- Digital Presence: ${enrichment.digitalPresence}\n`);

  lines.push(`## Key Talking Points`);
  const topDims = [...activeDims].sort((a, b) => b.score / b.maxScore - a.score / a.maxScore).slice(0, 3);
  for (const d of topDims) {
    lines.push(`- **${d.name} (${d.score}/${d.maxScore})**: ${d.rationale}`);
  }
  lines.push("");

  const inactiveDims = dimensions.filter((d) => d.optional && !d.active);
  if (inactiveDims.length > 0) {
    lines.push(`## Dimensions to Assess`);
    for (const d of inactiveDims) {
      lines.push(`- **${d.name}**: Not yet assessed — gather this info during the meeting`);
    }
    lines.push("");
  }

  if (redFlags.length > 0) {
    lines.push(`## Risk Areas to Address`);
    for (const rf of redFlags) {
      lines.push(`- **${rf.title}**: ${rf.description}`);
    }
    lines.push("");
  }

  lines.push(`## Comparable Success Stories`);
  for (const c of comparables.slice(0, 3)) {
    lines.push(`- **${c.name}** (${c.industry}): ${c.outcome}`);
  }
  lines.push("");

  lines.push(`## Suggested Offer Strategy`);
  lines.push(`- Current potential: ${enrichment.offerPotential}`);
  lines.push(`- Conversion type: ${enrichment.conversionType}`);
  lines.push(
    `- Recommended: Focus on ${enrichment.conversionCycleLength.toLowerCase().includes("instant") || enrichment.conversionCycleLength.toLowerCase().includes("short") ? "scaling quickly with high-volume offers" : "establishing robust CTL for downstream events before scaling spend"}`
  );

  return lines.join("\n");
}
