"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BrandInput from "@/components/BrandInput";
import ScoreCard, { GRADE_VERDICT } from "@/components/ScoreCard";
import DimensionCard from "@/components/DimensionCard";
import SpendProjection from "@/components/SpendProjection";
import RedFlags from "@/components/RedFlags";
import Recommendations from "@/components/Recommendations";
import Comparables from "@/components/Comparables";
import MeetingBrief from "@/components/MeetingBrief";
import LoadingState from "@/components/LoadingState";
import { ScoreResult } from "@/lib/types";
import {
  computeScore,
  computeMaxPossible,
  computeScorePercent,
  getGrade,
  getChurnRisk,
  predictSpend,
  detectRedFlags,
  generateRecommendations,
} from "@/lib/scoring";
import { Bookmark, BookmarkCheck, Link2, Pencil, Check } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

function recalcResult(base: ScoreResult, newDimensions: ScoreResult["dimensions"]): ScoreResult {
  const totalScore = computeScore(newDimensions);
  const maxPossibleScore = computeMaxPossible(newDimensions);
  const scorePercent = computeScorePercent(newDimensions);
  const grade = getGrade(scorePercent);
  const { risk: churnRisk, detail: churnRiskDetail } = getChurnRisk(totalScore, newDimensions);
  const predictedAnnualSpend = predictSpend(scorePercent);
  const redFlags = detectRedFlags(newDimensions);
  const recommendations = generateRecommendations(newDimensions);

  return {
    ...base,
    dimensions: newDimensions,
    totalScore,
    maxPossibleScore,
    scorePercent,
    grade,
    churnRisk,
    churnRiskDetail,
    predictedAnnualSpend,
    redFlags,
    recommendations,
  };
}

function DashboardContent() {
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [adjustedResult, setAdjustedResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "brief">("overview");
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [editingDomain, setEditingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const autoScoredRef = useRef(false);

  const handleScore = useCallback(async (brand: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAdjustedResult(null);
    setSaved(false);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to score brand");
      }

      const data: ScoreResult = await res.json();
      setResult(data);
      setAdjustedResult(data);

      window.history.replaceState({}, "", `?brand=${encodeURIComponent(brand)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam && !result && !loading && !autoScoredRef.current) {
      autoScoredRef.current = true;
      handleScore(brandParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleDimensionChange = useCallback(
    (dimensionId: string, newScore: number, newLabel: string) => {
      if (!adjustedResult) return;

      const newDimensions = adjustedResult.dimensions.map((d) =>
        d.id === dimensionId
          ? { ...d, score: newScore, selectedOption: newLabel, active: true }
          : d
      );

      setAdjustedResult(recalcResult(adjustedResult, newDimensions));
    },
    [adjustedResult]
  );

  const handleToggleActive = useCallback(
    (dimensionId: string, active: boolean) => {
      if (!adjustedResult) return;

      const newDimensions = adjustedResult.dimensions.map((d) =>
        d.id === dimensionId
          ? { ...d, active, score: active ? d.score : 0, selectedOption: active ? d.selectedOption : "" }
          : d
      );

      setAdjustedResult(recalcResult(adjustedResult, newDimensions));
    },
    [adjustedResult]
  );

  const handleSave = async () => {
    if (!adjustedResult) return;
    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: adjustedResult }),
      });
      setSaved(true);
    } catch {
      // silently fail
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyConfirm(true);
      setTimeout(() => setCopyConfirm(false), 2000);
    });
  };

  const isAdjusted =
    result && adjustedResult && result.scorePercent !== adjustedResult.scorePercent;

  return (
    <div className="space-y-6">
      {/* Hero + Input Section */}
      {!adjustedResult && !loading && (
        <div className="text-center pt-8 pb-2 max-w-2xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-3">ICP Scorer</h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Score any brand against the Rokt Ads Ideal Customer Profile. AI enrichment analyzes industry fit,
            conversion cycle, audience alignment, and more. Optional dimensions (offer strength, budget, data readiness)
            are excluded until you provide them, giving you a score that reflects what you actually know.
          </p>
        </div>
      )}

      <div className="max-w-2xl mx-auto animate-fade-in pt-1">
        <BrandInput onSubmit={handleScore} isLoading={loading} />
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {loading && <LoadingState />}

      {adjustedResult && !loading && (
        <div className="space-y-6 animate-slide-up">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo domain={adjustedResult.enrichment.website} name={adjustedResult.brand} size={32} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{adjustedResult.brand}</h2>
                  {isAdjusted && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-beetroot/15 text-beetroot-light border border-beetroot/25">
                      Adjusted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {editingDomain ? (
                    <form
                      className="flex items-center gap-1.5"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const cleaned = domainInput.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
                        if (cleaned && adjustedResult) {
                          setAdjustedResult({
                            ...adjustedResult,
                            enrichment: { ...adjustedResult.enrichment, website: cleaned },
                          });
                          if (result) {
                            setResult({
                              ...result,
                              enrichment: { ...result.enrichment, website: cleaned },
                            });
                          }
                        }
                        setEditingDomain(false);
                      }}
                    >
                      <input
                        type="text"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        className="text-xs bg-white/5 border border-white/15 rounded px-2 py-0.5 text-white/70 w-48 focus:outline-none focus:border-beetroot/50"
                        placeholder="example.com"
                        autoFocus
                      />
                      <button type="submit" className="text-emerald-400 hover:text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="text-xs text-white/40">
                        {adjustedResult.enrichment.website || "no domain"}
                      </span>
                      <button
                        onClick={() => {
                          setDomainInput(adjustedResult.enrichment.website || "");
                          setEditingDomain(true);
                        }}
                        className="text-white/30 hover:text-white/60"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveTab(activeTab === "overview" ? "brief" : "overview")
                }
                className="btn-secondary px-4 py-2 rounded-lg text-sm"
              >
                {activeTab === "overview" ? "Meeting Brief" : "Overview"}
              </button>
              <button
                onClick={handleCopyLink}
                className={`btn-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  copyConfirm ? "text-emerald-400 border-emerald-500/30" : ""
                }`}
              >
                <Link2 className="w-4 h-4" />
                {copyConfirm ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={handleSave}
                className={`btn-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  saved ? "text-emerald-400 border-emerald-500/30" : ""
                }`}
                disabled={saved}
              >
                {saved ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {activeTab === "brief" ? (
            <MeetingBrief brief={adjustedResult.meetingBrief} brand={adjustedResult.brand} />
          ) : (
            <>
              {/* Score Overview Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ScoreCard
                  brand={adjustedResult.brand}
                  totalScore={adjustedResult.totalScore}
                  maxPossibleScore={adjustedResult.maxPossibleScore}
                  scorePercent={adjustedResult.scorePercent}
                  grade={adjustedResult.grade}
                  churnRisk={adjustedResult.churnRisk}
                  churnRiskDetail={adjustedResult.churnRiskDetail}
                  confidence={adjustedResult.confidence}
                  predictedAnnualSpend={adjustedResult.predictedAnnualSpend}
                  website={adjustedResult.enrichment.website}
                />
                <SpendProjection
                  current={adjustedResult.predictedAnnualSpend}
                  original={
                    isAdjusted
                      ? result!.predictedAnnualSpend
                      : undefined
                  }
                />
              </div>

              {/* BD Verdict */}
              <div
                className="rounded-xl px-5 py-3"
                style={{
                  background: `${
                    { A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" }[adjustedResult.grade]
                  }10`,
                  borderLeft: `3px solid ${{ A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" }[adjustedResult.grade]}`,
                }}
              >
                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: { A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" }[adjustedResult.grade] }}
                >
                  {GRADE_VERDICT[adjustedResult.grade].verdict}
                </p>
                <p className="text-xs text-white/60 leading-relaxed">
                  {GRADE_VERDICT[adjustedResult.grade].detail}
                </p>
              </div>

              {/* Red Flags */}
              {adjustedResult.redFlags.length > 0 && (
                <RedFlags flags={adjustedResult.redFlags} />
              )}

              {/* Dimension Sliders */}
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Scoring dimensions
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Adjust to see what-if scenarios. Grayed-out dimensions are excluded from the score until you select a value.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adjustedResult.dimensions.map((dim) => (
                    <DimensionCard
                      key={dim.id}
                      dimension={dim}
                      onChange={handleDimensionChange}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <Recommendations
                recommendations={adjustedResult.recommendations}
              />

              {/* Comparables */}
              <Comparables comparables={adjustedResult.comparables} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
