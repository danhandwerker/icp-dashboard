import { readFileSync } from "fs";
import { join } from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RoktAdvertiserRecord {
  id: string;
  name: string;
  totalSpend: number;
  totalImpressions: number;
  totalReferrals: number;
  avgCTR: number;
  totalAcquisitions: number;
  primaryOfferType: string | null;
  offerTypes: string[];
  campaignCount: number;
  campaigns: string[];
}

interface RoktAdvertisersFile {
  lastUpdated: string;
  dateRange: { start: string; end: string };
  advertisers: RoktAdvertiserRecord[];
}

export interface RoktAdvertiserData {
  found: boolean;
  advertiserName?: string;
  isExistingAdvertiser: boolean;
  suggestedDimensions: {
    budget?: { score: number; label: string; rationale: string };
    offer?: { score: number; label: string; rationale: string };
  };
}

// ─── Cache ───────────────────────────────────────────────────────────────────

let _cache: RoktAdvertisersFile | null = null;

function getAdvertisers(): RoktAdvertiserRecord[] {
  if (_cache) return _cache.advertisers;

  try {
    const filePath = join(process.cwd(), "data", "rokt-advertisers.json");
    const raw = readFileSync(filePath, "utf-8");
    _cache = JSON.parse(raw) as RoktAdvertisersFile;
    return _cache.advertisers;
  } catch (err) {
    console.error("Failed to load rokt-advertisers.json:", err);
    return [];
  }
}

// ─── Fuzzy match ─────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Strip common suffixes that shouldn't affect matching
function stripSuffixes(s: string): string {
  return s
    .replace(/\b(inc|llc|ltd|corp|co|group|holdings|international|global|us|uk|ca|au)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(
  query: string,
  advertisers: RoktAdvertiserRecord[]
): RoktAdvertiserRecord | null {
  const normQuery = normalize(query);
  const strippedQuery = stripSuffixes(normQuery);

  // Pass 1: exact normalized name match
  for (const adv of advertisers) {
    if (normalize(adv.name) === normQuery) return adv;
  }

  // Pass 2: stripped exact match
  for (const adv of advertisers) {
    if (stripSuffixes(normalize(adv.name)) === strippedQuery) return adv;
  }

  // Pass 3: one contains the other (normalized)
  for (const adv of advertisers) {
    const normAdv = normalize(adv.name);
    if (normAdv.includes(normQuery) || normQuery.includes(normAdv)) return adv;
  }

  // Pass 4: stripped contains
  for (const adv of advertisers) {
    const strippedAdv = stripSuffixes(normalize(adv.name));
    if (
      strippedAdv.includes(strippedQuery) ||
      strippedQuery.includes(strippedAdv)
    ) {
      return adv;
    }
  }

  // Pass 5: word overlap (at least 1 meaningful word in common, min 4 chars)
  const queryWords = strippedQuery.split(" ").filter((w) => w.length >= 4);
  if (queryWords.length > 0) {
    let bestAdv: RoktAdvertiserRecord | null = null;
    let bestOverlap = 0;
    for (const adv of advertisers) {
      const advWords = stripSuffixes(normalize(adv.name))
        .split(" ")
        .filter((w) => w.length >= 4);
      const overlap = queryWords.filter((w) => advWords.includes(w)).length;
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestAdv = adv;
      }
    }
    if (bestOverlap > 0 && bestAdv) return bestAdv;
  }

  return null;
}

// ─── Dimension mapping ───────────────────────────────────────────────────────

function mapSpendToBudget(spend: number): {
  score: number;
  label: string;
  rationale: string;
} | undefined {
  if (spend >= 1_000_000) {
    return {
      score: 12,
      label: "$300k+ test with performance guarantee",
      rationale: "Based on existing Rokt Ads activity — enterprise-scale advertiser",
    };
  }
  if (spend >= 300_000) {
    return {
      score: 10,
      label: "$100-300k, 60+ day runway",
      rationale: "Based on existing Rokt Ads activity — strong mid-market advertiser",
    };
  }
  if (spend >= 100_000) {
    return {
      score: 8,
      label: "$50-100k, 30-60 days",
      rationale: "Based on existing Rokt Ads activity",
    };
  }
  if (spend >= 20_000) {
    return {
      score: 5,
      label: "$20-50k, 30+ days",
      rationale: "Based on existing Rokt Ads activity",
    };
  }
  return {
    score: 2,
    label: "<$20k or <30 days",
    rationale: "Based on existing Rokt Ads activity — early-stage advertiser",
  };
}

function mapOfferType(
  offerType: string | null,
  advertiserName: string
): { score: number; label: string; rationale: string } | undefined {
  if (!offerType) return undefined;

  const src = `Based on existing Rokt Ads campaign data for ${advertiserName}`;

  switch (offerType) {
    case "cash_reward":
      return { score: 15, label: "Cash reward / Cashback", rationale: src };
    case "free_trial":
      return {
        score: 14,
        label: "Free trial (streaming/subscription)",
        rationale: src,
      };
    case "percentage_off":
      return {
        score: 12,
        label: "Strong discount (>20% off)",
        rationale: src,
      };
    case "introductory_price":
      return { score: 11, label: "Introductory price", rationale: src };
    case "free_item":
      return {
        score: 10,
        label: "Free item / gift with purchase",
        rationale: src,
      };
    case "fixed_amount_off":
    case "up_to_fixed_amount_off":
      return {
        score: 9,
        label: "Moderate discount (10-20% off)",
        rationale: src,
      };
    case "coupon_code":
      return { score: 8, label: "Coupon / promo code", rationale: src };
    case "loyalty_points":
      return { score: 8, label: "Coupon / promo code", rationale: src };
    case "sweepstakes":
      return {
        score: 6,
        label: "Sweepstakes / contest entry",
        rationale: src,
      };
    case "no_offer":
      return undefined; // no suggestion — leave blank
    default:
      return undefined;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function lookupRoktAdvertiser(brandName: string): RoktAdvertiserData {
  const advertisers = getAdvertisers();
  const match = fuzzyMatch(brandName, advertisers);

  if (!match) {
    return {
      found: false,
      isExistingAdvertiser: false,
      suggestedDimensions: {},
    };
  }

  const budgetSuggestion = mapSpendToBudget(match.totalSpend);
  const offerSuggestion = mapOfferType(match.primaryOfferType, match.name);

  const suggestedDimensions: RoktAdvertiserData["suggestedDimensions"] = {};
  if (budgetSuggestion) suggestedDimensions.budget = budgetSuggestion;
  if (offerSuggestion) suggestedDimensions.offer = offerSuggestion;

  return {
    found: true,
    advertiserName: match.name,
    isExistingAdvertiser: true,
    suggestedDimensions,
  };
}
