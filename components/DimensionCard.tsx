"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, Database } from "lucide-react";
import type { DimensionScore, DimensionOption } from "@/lib/types";

interface DimensionCardProps {
  dimension: DimensionScore;
  onChange: (dimensionId: string, newScore: number, newOptionLabel: string) => void;
  onToggleActive?: (dimensionId: string, active: boolean) => void;
  animationDelay?: number;
  brandName?: string;
}

function scoreBarColor(pct: number): string {
  if (pct >= 0.8) return "#10b981";
  if (pct >= 0.6) return "#3b82f6";
  if (pct >= 0.4) return "#f59e0b";
  if (pct >= 0.2) return "#f97316";
  return "#ef4444";
}

export default function DimensionCard({
  dimension,
  onChange,
  onToggleActive,
  animationDelay = 0,
  brandName,
}: DimensionCardProps) {
  const isInactive = dimension.optional && !dimension.active;
  const pct = isInactive ? 0 : dimension.score / dimension.maxScore;
  const barColor = isInactive ? "rgba(255,255,255,0.15)" : scoreBarColor(pct);

  const [barWidth, setBarWidth] = useState(0);
  const [flash, setFlash] = useState(false);
  const prevScoreRef = useRef(dimension.score);
  const animFrameRef = useRef<number | null>(null);

  const [researching, setResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const researchErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleResearch = async () => {
    if (!brandName || researching) return;
    setResearching(true);
    setResearchError(null);

    try {
      const res = await fetch("/api/research-dimension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: brandName, dimensionId: dimension.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Research failed");
      }

      // Activate the dimension if it was inactive, then apply the result
      if (dimension.optional && !dimension.active && onToggleActive) {
        onToggleActive(dimension.id, true);
      }
      onChange(dimension.id, data.score, data.label);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Research failed";
      setResearchError(msg);
      if (researchErrorTimerRef.current) clearTimeout(researchErrorTimerRef.current);
      researchErrorTimerRef.current = setTimeout(() => setResearchError(null), 4000);
    } finally {
      setResearching(false);
    }
  };

  useEffect(() => {
    const targetPct = isInactive ? 0 : dimension.score / dimension.maxScore;
    const duration = 600;
    const startTime = performance.now();
    const startWidth = barWidth;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setBarWidth(startWidth + (targetPct * 100 - startWidth) * eased);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimension.score, dimension.maxScore, isInactive]);

  useEffect(() => {
    if (prevScoreRef.current !== dimension.score) {
      prevScoreRef.current = dimension.score;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [dimension.score]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;

    // "Clear" option for optional dimensions
    if (selectedLabel === "__clear__") {
      if (onToggleActive) onToggleActive(dimension.id, false);
      return;
    }

    const option = dimension.options.find((o) => o.label === selectedLabel);
    if (option) {
      // Activate if optional and inactive
      if (dimension.optional && !dimension.active && onToggleActive) {
        onToggleActive(dimension.id, true);
      }
      onChange(dimension.id, option.value, option.label);
    }
  };

  return (
    <div
      className={`card-surface p-4 animate-fade-in transition-all duration-300 ${
        flash ? "ring-1 ring-beetroot-light/40" : ""
      } ${isInactive ? "" : ""}`}
      style={{
        animationDelay: `${animationDelay}s`,
        ...(isInactive
          ? {
              borderLeft: "3px solid rgba(245, 158, 11, 0.6)",
              background: "rgba(245, 158, 11, 0.04)",
            }
          : {}),
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white">{dimension.name}</h3>
            {/* Source badge: AI, CRM, or optional status */}
            {!dimension.optional && dimension.source !== "crm" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </span>
            )}
            {dimension.source === "crm" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Database className="w-2.5 h-2.5" />
                Rokt
              </span>
            )}
            {/* Status badge for optional dimensions not filled from CRM */}
            {dimension.optional && dimension.source !== "crm" && (
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                isInactive
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                  : "bg-beetroot/15 text-beetroot-light border border-beetroot/25"
              }`}>
                {isInactive && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                  </span>
                )}
                {isInactive ? "Not included" : "User input"}
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 leading-snug line-clamp-2 ${isInactive ? "text-amber-400/50" : "text-white/40"}`}>
            {isInactive
              ? "Select a value below to include this dimension"
              : (dimension.options.find((o) => o.label === dimension.selectedOption)?.description ?? "")}
          </p>
        </div>
        {/* Score chip */}
        <div
          className="shrink-0 flex items-baseline gap-0.5 text-sm font-bold tabular-nums"
          style={{ color: isInactive ? "rgba(255,255,255,0.2)" : barColor }}
        >
          {isInactive ? "—" : dimension.score}
          <span className="text-xs text-white/30 font-normal">/{dimension.maxScore}</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="relative h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
          style={{
            width: `${barWidth}%`,
            background: isInactive ? "rgba(255,255,255,0.1)" : barColor,
            boxShadow: isInactive ? "none" : `0 0 8px ${barColor}80`,
          }}
        />
      </div>

      {/* Dropdown selector */}
      <div className="relative mb-3">
        <select
          value={isInactive ? "__clear__" : dimension.selectedOption}
          onChange={handleSelectChange}
          className="w-full appearance-none text-xs text-white bg-transparent border border-white/10 rounded-lg px-3 py-2 pr-8 cursor-pointer hover:border-white/20 focus:outline-none focus:border-beetroot-light/60 transition-colors"
          style={{ background: "var(--color-surface-2)" }}
        >
          {dimension.optional && (
            <option value="__clear__" style={{ background: "var(--color-card)" }}>
              — Not assessed (excluded from score) —
            </option>
          )}
          {dimension.options.map((option: DimensionOption) => (
            <option
              key={option.label}
              value={option.label}
              style={{ background: "var(--color-card)" }}
            >
              {option.label} ({option.value} pts)
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
            <path d="M0 0l5 6 5-6z" />
          </svg>
        </div>
      </div>

      {/* Research this button — only for optional dimensions when brandName is available */}
      {dimension.optional && brandName && (
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={handleResearch}
            disabled={researching}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/50 hover:text-white/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {researching ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Research this
              </>
            )}
          </button>
          {researchError && (
            <span className="text-xs text-red-400/80 animate-fade-in">
              {researchError}
            </span>
          )}
        </div>
      )}

      {/* Rationale */}
      {!isInactive && (
        <p className="text-xs text-white/40 italic leading-relaxed">{dimension.rationale}</p>
      )}
    </div>
  );
}
