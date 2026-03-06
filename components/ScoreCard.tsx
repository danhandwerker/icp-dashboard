"use client";

import { useEffect, useRef, useState } from "react";
import type { Grade, ChurnRisk, Confidence } from "@/lib/types";
import BrandLogo from "./BrandLogo";

interface ScoreCardProps {
  brand: string;
  totalScore: number;
  grade: Grade;
  churnRisk: ChurnRisk;
  churnRiskDetail: string;
  confidence: Confidence;
  predictedAnnualSpend: { low: number; mid: number; high: number };
  website?: string;
}

const GRADE_COLORS: Record<Grade, string> = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#f97316",
  F: "#ef4444",
};

export const GRADE_VERDICT: Record<Grade, { verdict: string; detail: string }> = {
  A: {
    verdict: "Excellent fit",
    detail: "This brand aligns strongly across all key dimensions. The industry, offer potential, conversion cycle, and data readiness all point to a high-performing Rokt Ads partnership. Fast-track to a tailored proposal.",
  },
  B: {
    verdict: "Strong fit",
    detail: "Good alignment on most dimensions with a few areas to strengthen. Focus early conversations on the strongest signals and have a plan to close the gaps before scaling spend.",
  },
  C: {
    verdict: "Moderate fit",
    detail: "Reasonable alignment but notable gaps exist. Review the red flags and recommendations below to identify what would need to change for this to work well. Some gaps may be addressable, others may be structural.",
  },
  D: {
    verdict: "Weak fit",
    detail: "Significant gaps across multiple dimensions. Unless there's a clear path to closing them (e.g., upgrading data infrastructure, adjusting offer strategy), the likelihood of a successful partnership is low.",
  },
  F: {
    verdict: "Poor fit",
    detail: "Fundamental misalignment with what makes Rokt Ads work. The gaps here are structural, not tactical. If inbound, set clear expectations about limitations upfront.",
  },
};

const GRADE_GLOW: Record<Grade, string> = {
  A: "rgba(16,185,129,0.4)",
  B: "rgba(59,130,246,0.4)",
  C: "rgba(245,158,11,0.4)",
  D: "rgba(249,115,22,0.4)",
  F: "rgba(239,68,68,0.4)",
};

export default function ScoreCard({
  brand,
  totalScore,
  grade,
  churnRisk,
  churnRiskDetail,
  confidence,
  website,
}: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [strokeOffset, setStrokeOffset] = useState(283);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 900;
    const startTime = performance.now();
    const circumference = 283;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * totalScore);
      setDisplayScore(current);
      setStrokeOffset(circumference - (circumference * eased * totalScore) / 100);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [totalScore]);

  const gradeColor = GRADE_COLORS[grade];
  const gradeGlow = GRADE_GLOW[grade];

  return (
    <div className="card p-5 animate-slide-up flex flex-col gap-4 h-full">
      {/* Brand name */}
      <div>
        <p className="text-xs uppercase tracking-widest text-white/40 font-medium mb-1">
          ICP Score
        </p>
        <div className="flex items-center gap-2">
          <BrandLogo domain={website} name={brand} size={28} />
          <h2 className="text-xl font-bold text-white truncate">{brand}</h2>
        </div>
      </div>

      {/* Gauge + grade block */}
      <div className="flex items-center gap-5">
        {/* SVG circular gauge */}
        <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={gradeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={strokeOffset}
              style={{
                filter: `drop-shadow(0 0 6px ${gradeGlow})`,
                transition: "stroke 0.4s ease",
              }}
            />
          </svg>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: gradeColor, lineHeight: 1 }}
            >
              {displayScore}
            </span>
            <span className="text-[10px] text-white/40 mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Grade + badges */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-4xl font-bold grade-${grade.toLowerCase()}`}
              style={{ filter: `drop-shadow(0 0 8px ${gradeGlow})` }}
            >
              {grade}
            </span>
            <span className="text-xs text-white/40 leading-tight">
              Fit<br />Grade
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full risk-${churnRisk}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: churnRisk === "low" ? "#34d399" : churnRisk === "medium" ? "#fbbf24" : "#f87171",
              }}
            />
            {churnRisk.charAt(0).toUpperCase() + churnRisk.slice(1)} Churn Risk
          </span>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full confidence-${confidence}`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <circle cx="5" cy="5" r="4" fillOpacity="0.5" />
              <circle cx="5" cy="5" r="2" />
            </svg>
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
          </span>
        </div>
      </div>

      {/* Churn risk detail */}
      <p className="text-xs text-white/50 leading-relaxed">{churnRiskDetail}</p>
    </div>
  );
}
