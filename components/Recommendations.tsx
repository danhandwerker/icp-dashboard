"use client";

import { ArrowRight, TrendingUp, Zap } from "lucide-react";
import type { Recommendation } from "@/lib/types";

interface RecommendationsProps {
  recommendations: Recommendation[];
}

function ScoreDelta({ from, to }: { from: number; to: number }) {
  const diff = to - from;
  const color = diff > 0 ? "#10b981" : "#f87171";
  return (
    <div className="flex items-center gap-1 text-xs font-semibold tabular-nums" style={{ color }}>
      <span>{from}</span>
      <ArrowRight size={10} />
      <span>{to}</span>
      <span className="text-xs font-medium opacity-70">
        (+{diff})
      </span>
    </div>
  );
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} className="text-white/30" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">
            Path to A
          </h3>
        </div>
        <div className="flex flex-col items-center py-6 gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Zap size={16} className="text-emerald-400" />
          </div>
          <p className="text-sm text-emerald-400 font-medium">Already at maximum score</p>
          <p className="text-xs text-white/30 text-center">All dimensions are optimized.</p>
        </div>
      </div>
    );
  }

  const topThree = new Set(recommendations.slice(0, 3).map((r) => r.dimension + r.action));

  return (
    <div className="card p-5 animate-fade-in delay-3 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp size={15} className="text-beetroot" style={{ color: "#C20075" }} />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">
          Path to A
        </h3>
        <span className="ml-auto text-xs text-white/30">
          {recommendations.length} action{recommendations.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {recommendations.map((rec, index) => {
          const key = rec.dimension + rec.action;
          const isTop = topThree.has(key);
          const diff = rec.potentialScore - rec.currentScore;

          return (
            <div
              key={key}
              className={`rounded-xl p-4 animate-fade-in transition-all ${
                isTop
                  ? "border border-beetroot/20 bg-beetroot/5"
                  : "border border-white/8"
              }`}
              style={{
                background: isTop
                  ? "linear-gradient(135deg, rgba(194,0,117,0.08), rgba(72,0,41,0.06))"
                  : "rgba(255,255,255,0.03)",
                animationDelay: `${index * 0.08}s`,
              }}
            >
              {/* Row 1: rank + dimension + top badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                  style={{
                    background: isTop ? "rgba(194,0,117,0.3)" : "rgba(255,255,255,0.07)",
                    color: isTop ? "#E0008A" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {index + 1}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: isTop ? "#E0008A" : "rgba(255,255,255,0.6)" }}
                >
                  {rec.dimension}
                </span>
                {isTop && (
                  <span
                    className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(194,0,117,0.18)",
                      color: "#E0008A",
                    }}
                  >
                    Top impact
                  </span>
                )}
              </div>

              {/* Row 2: action text */}
              <p className="text-xs text-white/70 leading-relaxed mb-3">{rec.action}</p>

              {/* Row 3: score delta + spend impact */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/30">Score:</span>
                  <ScoreDelta from={rec.currentScore} to={rec.potentialScore} />
                </div>

                {diff > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} style={{ color: "#10b981" }} />
                    <span className="text-xs font-medium" style={{ color: "#10b981" }}>
                      +{diff} pts
                    </span>
                  </div>
                )}

                {rec.spendImpact && rec.spendImpact !== "No change to predicted spend range" && (
                  <p className="text-xs text-white/40 w-full">{rec.spendImpact}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
