"use client";

import { useEffect, useRef, useState } from "react";

interface SpendRange {
  low: number;
  mid: number;
  high: number;
}

interface SpendProjectionProps {
  current: SpendRange;
  original?: SpendRange | null;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

function useAnimatedNumber(target: number, duration = 600): number {
  const [displayed, setDisplayed] = useState(target);
  const prevRef = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return displayed;
}

function RangeBar({ low, mid, high, color }: SpendRange & { color: string }) {
  const total = high || 1;
  const lowPct = (low / total) * 100;
  const midPct = (mid / total) * 100;

  return (
    <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      {/* Low range fill */}
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
        style={{
          width: `${midPct}%`,
          background: `${color}40`,
        }}
      />
      {/* Low to mid fill */}
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
        style={{
          width: `${lowPct}%`,
          background: `${color}30`,
        }}
      />
      {/* Mid marker */}
      <div
        className="absolute top-0 h-full w-0.5 transition-all duration-700"
        style={{
          left: `${midPct}%`,
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    </div>
  );
}

export default function SpendProjection({ current, original }: SpendProjectionProps) {
  const animatedMid = useAnimatedNumber(current.mid);
  const animatedLow = useAnimatedNumber(current.low);
  const animatedHigh = useAnimatedNumber(current.high);

  const hasWhatIf =
    original !== null &&
    original !== undefined &&
    (original.mid !== current.mid || original.low !== current.low || original.high !== current.high);

  const midDiff = hasWhatIf && original ? current.mid - original.mid : 0;

  return (
    <div className="card p-5 animate-fade-in delay-2 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white uppercase tracking-widest opacity-60">
          Predicted Annual Spend
        </h3>
        {hasWhatIf && midDiff !== 0 && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              midDiff > 0
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-red-400 bg-red-400/10"
            }`}
          >
            {midDiff > 0 ? "+" : ""}
            {formatCurrency(midDiff)} vs original
          </span>
        )}
      </div>

      {/* Main mid figure */}
      <div className="text-center py-2">
        <div
          className="text-4xl font-bold tabular-nums"
          style={{ color: "#C20075", textShadow: "0 0 30px rgba(194,0,117,0.4)" }}
        >
          {formatCurrency(animatedMid)}
        </div>
        <p className="text-xs text-white/40 mt-1">midpoint estimate</p>
      </div>

      {/* Range bar */}
      <RangeBar low={current.low} mid={current.mid} high={current.high} color="#C20075" />

      {/* Low / Mid / High labels */}
      <div className="grid grid-cols-3 text-center">
        <div>
          <p className="text-xs text-white/40">Low</p>
          <p className="text-sm font-semibold text-white/70 tabular-nums">
            {formatCurrency(animatedLow)}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/40">Mid</p>
          <p
            className="text-sm font-bold tabular-nums"
            style={{ color: "#C20075" }}
          >
            {formatCurrency(animatedMid)}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/40">High</p>
          <p className="text-sm font-semibold text-white/70 tabular-nums">
            {formatCurrency(animatedHigh)}
          </p>
        </div>
      </div>

      {/* What-if comparison row */}
      {hasWhatIf && original && (
        <div className="border-t border-white/8 pt-3">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
            What-if comparison
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-white/40 mb-1">Original</p>
              <RangeBar
                low={original.low}
                mid={original.mid}
                high={Math.max(original.high, current.high)}
                color="#6b7280"
              />
              <p className="text-xs text-white/50 mt-1 tabular-nums">{formatCurrency(original.mid)}</p>
            </div>
            <div className="text-white/20 text-xs">vs</div>
            <div className="flex-1">
              <p className="text-xs text-white/40 mb-1">Adjusted</p>
              <RangeBar
                low={current.low}
                mid={current.mid}
                high={Math.max(original.high, current.high)}
                color="#C20075"
              />
              <p
                className="text-xs mt-1 tabular-nums font-semibold"
                style={{ color: "#C20075" }}
              >
                {formatCurrency(current.mid)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
