"use client";

import { useEffect, useRef, useState } from "react";
import type { DimensionScore, DimensionOption } from "@/lib/types";

interface DimensionCardProps {
  dimension: DimensionScore;
  onChange: (dimensionId: string, newScore: number, newOptionLabel: string) => void;
  onToggleActive?: (dimensionId: string, active: boolean) => void;
  animationDelay?: number;
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
}: DimensionCardProps) {
  const isInactive = dimension.optional && !dimension.active;
  const pct = isInactive ? 0 : dimension.score / dimension.maxScore;
  const barColor = isInactive ? "rgba(255,255,255,0.15)" : scoreBarColor(pct);

  const [barWidth, setBarWidth] = useState(0);
  const [flash, setFlash] = useState(false);
  const prevScoreRef = useRef(dimension.score);
  const animFrameRef = useRef<number | null>(null);

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
      } ${isInactive ? "opacity-60" : ""}`}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{dimension.name}</h3>
            {dimension.optional && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                isInactive
                  ? "bg-white/5 text-white/30 border border-white/10"
                  : "bg-beetroot/15 text-beetroot-light border border-beetroot/25"
              }`}>
                {isInactive ? "Not included" : "User input"}
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 mt-0.5 leading-snug line-clamp-2">
            {isInactive
              ? "Select a value to include this dimension in scoring"
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

      {/* Rationale */}
      {!isInactive && (
        <p className="text-xs text-white/40 italic leading-relaxed">{dimension.rationale}</p>
      )}
    </div>
  );
}
