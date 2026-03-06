"use client";

import { Users } from "lucide-react";
import type { Comparable } from "@/lib/types";
import BrandLogo from "./BrandLogo";

interface ComparablesProps {
  comparables: Comparable[];
}

const INDUSTRY_ICONS: Record<string, string> = {
  Finance: "💳",
  Fintech: "💳",
  Streaming: "📺",
  Media: "📺",
  "Food Delivery": "🍔",
  "Meal Kits": "🥗",
  QSR: "🍔",
  Retail: "🛍️",
  "E-commerce": "🛍️",
  Insurance: "🛡️",
  Gaming: "🎮",
  Betting: "🎲",
  Travel: "✈️",
  Hospitality: "🏨",
  Nonprofit: "❤️",
  Charity: "❤️",
  Health: "💊",
  Beauty: "✨",
  Wellness: "🧘",
  Automotive: "🚗",
  Education: "📚",
  Telecom: "📱",
};

function industryEmoji(industry: string): string {
  for (const [key, emoji] of Object.entries(INDUSTRY_ICONS)) {
    if (industry.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return "🏢";
}

export default function Comparables({ comparables }: ComparablesProps) {
  return (
    <div className="card p-5 animate-fade-in delay-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users size={15} className="text-white/40" />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">
          Comparable Brands
        </h3>
        <span className="ml-auto text-xs text-white/30">
          {comparables.length} similar
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {comparables.map((c, i) => (
          <div
            key={c.name}
            className="rounded-xl p-3.5 border border-white/8 hover:border-white/15 transition-all duration-200 animate-fade-in"
            style={{
              background: "rgba(255,255,255,0.03)",
              animationDelay: `${i * 0.07}s`,
            }}
          >
            {/* Brand name + logo */}
            <div className="flex items-center gap-2 mb-2">
              <BrandLogo domain={c.domain} name={c.name} size={28} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                <p className="text-xs text-white/40 truncate">{c.industry}</p>
              </div>
            </div>

            {/* Outcome */}
            <p className="text-xs text-white/60 leading-snug mb-2">{c.outcome}</p>

            {/* Similarity reason */}
            <div
              className="text-xs rounded-md px-2 py-1"
              style={{
                background: "rgba(194,0,117,0.08)",
                color: "rgba(224,0,138,0.9)",
                borderLeft: "2px solid rgba(194,0,117,0.4)",
              }}
            >
              {c.similarity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
