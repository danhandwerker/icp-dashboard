export type Grade = "A" | "B" | "C" | "D" | "F";

export type ChurnRisk = "low" | "medium" | "high";

export type Confidence = "high" | "medium" | "low";

export interface DimensionScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  rationale: string;
  selectedOption: string;
  options: DimensionOption[];
  optional?: boolean;
  active?: boolean;
  source?: "ai" | "crm" | "user";
}

export interface DimensionOption {
  label: string;
  value: number;
  description?: string;
}

export interface RedFlag {
  title: string;
  description: string;
  pattern: string;
  severity: "critical" | "warning";
}

export interface Recommendation {
  dimension: string;
  currentScore: number;
  potentialScore: number;
  action: string;
  impact: string;
  spendImpact: string;
}

export interface Comparable {
  name: string;
  industry: string;
  outcome: string;
  similarity: string;
  domain?: string;
}

export interface BrandEnrichment {
  name: string;
  industry: string;
  subIndustry: string;
  description: string;
  estimatedRevenue: string;
  estimatedEmployees: string;
  digitalPresence: string;
  adTechStack: string;
  conversionType: string;
  conversionCycleLength: string;
  offerPotential: string;
  regulatoryEnvironment: string;
  audienceType: string;
  existingAdChannels: string;
  estimatedTestBudget: string;
  measurementApproach: string;
  website: string;
  confidence: Confidence;
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

export interface ScoreResult {
  brand: string;
  totalScore: number;
  maxPossibleScore: number;
  scorePercent: number;
  grade: Grade;
  churnRisk: ChurnRisk;
  churnRiskDetail: string;
  confidence: Confidence;
  predictedAnnualSpend: { low: number; mid: number; high: number };
  dimensions: DimensionScore[];
  redFlags: RedFlag[];
  recommendations: Recommendation[];
  comparables: Comparable[];
  enrichment: BrandEnrichment;
  meetingBrief: string;
  scoredAt: string;
  roktData?: RoktAdvertiserData;
}

export interface SavedScore {
  id: string;
  userId: string;
  userEmail: string;
  brand: string;
  totalScore: number;
  grade: Grade;
  churnRisk: ChurnRisk;
  predictedSpendMid: number;
  result: ScoreResult;
  createdAt: string;
  notes?: string;
}

export interface BatchScoreRequest {
  brands: string[];
}

export interface PortfolioSummary {
  total: number;
  gradeDistribution: Record<Grade, number>;
  avgScore: number;
  totalPredictedSpend: number;
  topRisks: RedFlag[];
}
