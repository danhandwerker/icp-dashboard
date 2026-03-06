"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { RedFlag } from "@/lib/types";

interface RedFlagsProps {
  flags: RedFlag[];
}

function FlagItem({ flag, index }: { flag: RedFlag; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const isCritical = flag.severity === "critical";
  const borderColor = isCritical ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)";
  const bgColor = isCritical ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)";
  const iconColor = isCritical ? "#f87171" : "#fbbf24";
  const labelBg = isCritical ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)";
  const labelColor = isCritical ? "#f87171" : "#fbbf24";

  return (
    <div
      className="rounded-xl overflow-hidden animate-fade-in"
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer hover:bg-white/[0.03] transition-colors"
      >
        <div className="shrink-0 mt-0.5" style={{ color: iconColor }}>
          {isCritical ? (
            <AlertTriangle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{flag.title}</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: labelBg, color: labelColor }}
            >
              {flag.severity}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-white/30 mt-0.5">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Collapsible detail */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? "200px" : "0px" }}
      >
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-white/60 leading-relaxed">{flag.description}</p>
          {flag.pattern && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">Pattern:</span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
              >
                {flag.pattern}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedFlags({ flags }: RedFlagsProps) {
  if (flags.length === 0) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={15} className="text-white/30" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">
            Red Flags
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3,9 7,13 15,5" />
            </svg>
          </div>
          <p className="text-sm text-emerald-400 font-medium">No red flags detected</p>
          <p className="text-xs text-white/30 text-center max-w-xs">
            This brand does not match any known churn patterns.
          </p>
        </div>
      </div>
    );
  }

  const criticalCount = flags.filter((f) => f.severity === "critical").length;
  const warningCount = flags.filter((f) => f.severity === "warning").length;

  return (
    <div className="card p-5 animate-fade-in flex flex-col gap-4">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-400" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">
            Red Flags
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-red-400 bg-red-400/10">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-amber-400 bg-amber-400/10">
              {warningCount} warning
            </span>
          )}
        </div>
      </div>

      {/* Flag list */}
      <div className="flex flex-col gap-2">
        {flags.map((flag, i) => (
          <FlagItem key={flag.title} flag={flag} index={i} />
        ))}
      </div>
    </div>
  );
}
