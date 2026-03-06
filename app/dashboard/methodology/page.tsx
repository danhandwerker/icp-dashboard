"use client";

import { DIMENSIONS } from "@/lib/scoring";
import { Info, AlertTriangle, TrendingUp, Target, BarChart3, Shield } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          How it works
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
          The Rokt Ads ICP Dashboard scores prospects across 8 dimensions derived from
          analysis of Rokt's top-performing advertisers, the FY27Q1 Churn
          Analysis, and internal GTM handbooks. Here's exactly how each score is
          calculated.
        </p>
      </div>

      {/* Data Sources */}
      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-beetroot-light" />
          Data sources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="card-surface p-4">
            <p className="font-medium mb-1">Rokt Reporting API</p>
            <p className="text-gray-400 text-xs">
              50+ advertiser performance profiles: spend, impressions, referrals,
              acquisitions, ROAS, CPA. Analyzed across H1 2025 vs H2 2025+
              for growth trends. Broken down by country, device, campaign
              objective, offer type, and partner vertical.
            </p>
          </div>
          <div className="card-surface p-4">
            <p className="font-medium mb-1">FY27Q1 Churn Analysis</p>
            <p className="text-gray-400 text-xs">
              52% average churn rate, 15 regrettable churn accounts analyzed.
              Key finding: advertisers who scale past Day 90 retain at 96%.
              Unrealistic CPA/ROAS targets cause 34% of churn. Long conversion
              cycles cause 46% of regrettable churn.
            </p>
          </div>
          <div className="card-surface p-4">
            <p className="font-medium mb-1">RoktGPT / GTM Handbooks</p>
            <p className="text-gray-400 text-xs">
              Internal ICP framework, vertical performance, offer strength
              guidance, EMQ benchmarks, minimum budget thresholds ($100k US,
              $40k international), and integration best practices.
            </p>
          </div>
          <div className="card-surface p-4">
            <p className="font-medium mb-1">AI Brand Enrichment</p>
            <p className="text-gray-400 text-xs">
              Each brand is enriched using AI to assess industry,
              company size, offer potential, conversion cycle, ad-tech stack,
              regulatory environment, and measurement maturity based on public
              knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Scoring Dimensions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-beetroot-light" />
          Scoring dimensions (100 points total)
        </h2>
        <div className="space-y-3">
          {DIMENSIONS.map((dim) => (
            <div key={dim.id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{dim.name}</h3>
                <span className="text-xs font-mono text-gray-400">
                  0-{dim.maxScore} pts
                </span>
              </div>
              <p className="text-sm text-gray-400">{dim.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dim.options.map((opt) => (
                  <div
                    key={opt.label}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface/50 text-xs"
                  >
                    <span className="text-gray-300">{opt.label}</span>
                    <span className="font-mono text-beetroot-light">
                      {opt.value} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grade Mapping */}
      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-beetroot-light" />
          Grade mapping and predicted spend
        </h2>
        <div className="space-y-2">
          {[
            { grade: "A", range: "85-100", spend: "$5M - $50M+", desc: "Exceptional fit, fast-track sales", color: "grade-a" },
            { grade: "B", range: "70-84", spend: "$1M - $10M", desc: "Strong fit, high priority prospect", color: "grade-b" },
            { grade: "C", range: "55-69", spend: "$200k - $2M", desc: "Good fit with addressable gaps", color: "grade-c" },
            { grade: "D", range: "40-54", spend: "$50k - $500k", desc: "Moderate fit, needs specific conditions", color: "grade-d" },
            { grade: "F", range: "0-39", spend: "<$100k", desc: "Poor fit, deprioritize", color: "grade-f" },
          ].map((g) => (
            <div
              key={g.grade}
              className="flex items-center gap-4 p-3 rounded-lg bg-surface/50"
            >
              <span className={`text-2xl font-bold w-8 ${g.color}`}>
                {g.grade}
              </span>
              <div className="flex-1">
                <span className="text-sm font-medium">{g.desc}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({g.range} pts)
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400">
                {g.spend}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Red Flag Patterns */}
      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Red flag patterns (from churn analysis)
        </h2>
        <div className="space-y-3 text-sm">
          {[
            {
              name: "Downstream Optimization Trap",
              pattern: "Fetch Pet Insurance, Payward",
              desc: "Long conversion cycle + weak CTL. Real KPI is a downstream event that's hard to optimize toward. Caused 46% of regrettable churn.",
            },
            {
              name: "Measurement Misalignment",
              pattern: "SoFi",
              desc: "Rigid internal attribution conflicts with Rokt reporting, eroding trust before the channel proves value. SoFi took 6+ weeks to hit first success.",
            },
            {
              name: "Weak Offer",
              pattern: "WSJ",
              desc: "Offer strength is the single biggest lever. WSJ churned on anything other than their $1/week offer.",
            },
            {
              name: "Insufficient Learning Budget",
              pattern: "Cold-start spiral",
              desc: "Budget below $50k or runway under 30 days. Churned advertisers miss CPA targets by 177% vs 47% for retained.",
            },
            {
              name: "Limited Supply Fit",
              pattern: "Shutterfly B2B",
              desc: "Narrow or B2B audience limits auction exposure. Fewer auctions = can't learn = can't scale.",
            },
            {
              name: "Regulatory Constraints",
              pattern: "Mistplay, Phia",
              desc: "Heavy regulations block advanced audience and optimization tools, constraining scale potential.",
            },
          ].map((rf) => (
            <div key={rf.name} className="card-surface p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="font-medium">{rf.name}</span>
                <span className="text-xs text-gray-500 ml-auto font-mono">
                  {rf.pattern}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{rf.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Confidence */}
      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-beetroot-light" />
          Score confidence
        </h2>
        <p className="text-sm text-gray-400">
          Each score includes a confidence level based on how much public
          information is available about the brand:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
            <span className="confidence-high px-2 py-0.5 rounded text-xs font-medium">
              High
            </span>
            <span className="text-gray-300">
              Well-known brand with extensive public data. Score is highly reliable.
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
            <span className="confidence-medium px-2 py-0.5 rounded text-xs font-medium">
              Medium
            </span>
            <span className="text-gray-300">
              Mid-size brand. Some assumptions made about integration readiness and measurement.
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
            <span className="confidence-low px-2 py-0.5 rounded text-xs font-medium">
              Low
            </span>
            <span className="text-gray-300">
              Limited public information. Recommend manual validation of key dimensions before relying on score.
            </span>
          </div>
        </div>
      </section>

      <div className="text-center text-xs text-gray-600 pt-4">
        Built with data from the Rokt Reporting API, FY27Q1 Churn Analysis,
        and internal GTM handbooks.
      </div>
    </div>
  );
}
