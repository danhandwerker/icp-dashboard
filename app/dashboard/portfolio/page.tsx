"use client";

import { useState } from "react";
import { ScoreResult, Grade } from "@/lib/types";
import { Upload, Download, Loader2, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const GRADE_COLORS: Record<Grade, string> = {
  A: "bg-grade-a/20 text-emerald-400 border-emerald-500/30",
  B: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  C: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  D: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  F: "bg-red-500/20 text-red-400 border-red-500/30",
};

function fmtSpend(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export default function PortfolioPage() {
  const [brands, setBrands] = useState("");
  const [results, setResults] = useState<ScoreResult[]>([]);
  const [errors, setErrors] = useState<{ brand: string; error: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"score" | "spend" | "risk">("score");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);

      if (lines.length === 0) return;

      // Check for header row
      const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const brandColIndex = header.findIndex((h) =>
        ["account", "brand", "company", "name", "account name", "account_name", "company name", "company_name"].includes(h)
      );

      let brandNames: string[];
      if (brandColIndex >= 0) {
        // Extract from specific column
        brandNames = lines.slice(1).map((line) => {
          const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          return cols[brandColIndex] || "";
        });
      } else {
        // Treat each line as a brand name
        brandNames = lines.map((l) => l.replace(/^"|"$/g, "").trim());
      }

      const unique = [...new Set(brandNames.filter(Boolean))];
      setBrands(unique.join("\n"));
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const handleBatch = async () => {
    const brandList = brands
      .split(/[\n,]+/)
      .map((b) => b.trim())
      .filter(Boolean);

    if (brandList.length === 0) return;

    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch("/api/batch-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brands: brandList }),
      });

      const data = await res.json();
      setResults(data.results || []);
      setErrors(data.errors || []);
    } catch {
      setErrors([{ brand: "batch", error: "Failed to score brands" }]);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "score") return b.totalScore - a.totalScore;
    if (sortBy === "spend")
      return b.predictedAnnualSpend.mid - a.predictedAnnualSpend.mid;
    // risk: high first
    const riskOrder = { high: 0, medium: 1, low: 2 };
    return riskOrder[a.churnRisk] - riskOrder[b.churnRisk];
  });

  const gradeDistribution = results.reduce(
    (acc, r) => {
      acc[r.grade] = (acc[r.grade] || 0) + 1;
      return acc;
    },
    {} as Record<Grade, number>
  );

  const totalPredictedSpend = results.reduce(
    (sum, r) => sum + r.predictedAnnualSpend.mid,
    0
  );

  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.totalScore, 0) / results.length)
      : 0;

  const downloadCSV = () => {
    const headers = [
      "Brand",
      "Industry",
      "Sub-Industry",
      "Score",
      "Grade",
      "Churn Risk",
      "Predicted Spend (Mid)",
      "Predicted Spend (Low)",
      "Predicted Spend (High)",
      "Red Flags",
      "Confidence",
      "Offer Potential",
      "Conversion Cycle",
      "Ad Tech Stack",
    ];

    const rows = sorted.map((r) => [
      r.brand,
      r.enrichment.industry,
      r.enrichment.subIndustry,
      r.totalScore,
      r.grade,
      r.churnRisk,
      r.predictedAnnualSpend.mid,
      r.predictedAnnualSpend.low,
      r.predictedAnnualSpend.high,
      r.redFlags.map((f) => f.title).join("; "),
      r.confidence,
      r.enrichment.offerPotential,
      r.enrichment.conversionCycleLength,
      r.enrichment.adTechStack,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `icp-portfolio-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Portfolio scoring
        </h1>
        <p className="text-sm text-gray-400">
          Score up to 25 brands at once. Upload a CSV or paste brand names separated by commas
          or newlines.
        </p>
      </div>

      {/* Input Section */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-3">
          <label className="btn-secondary px-4 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload CSV
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>
          <span className="text-xs text-gray-500">
            or paste brand names below
          </span>
        </div>
        <textarea
          value={brands}
          onChange={(e) => setBrands(e.target.value)}
          placeholder="Netflix, Spotify, Uber, DoorDash, Peloton..."
          className="input-brand w-full h-32 p-4 text-sm resize-none"
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {brands.split(/[\n,]+/).filter((b) => b.trim()).length} brands
          </span>
          <button
            onClick={handleBatch}
            disabled={loading || !brands.trim()}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scoring...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                Score all brands
              </>
            )}
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
          <p className="text-red-400 font-medium mb-2">
            Failed to score {errors.length} brand(s):
          </p>
          {errors.map((e, i) => (
            <p key={i} className="text-red-300/70">
              {e.brand}: {e.error}
            </p>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-surface p-4">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" /> Brands scored
              </div>
              <div className="text-2xl font-bold">{results.length}</div>
            </div>
            <div className="card-surface p-4">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Avg score
              </div>
              <div className="text-2xl font-bold">{avgScore}</div>
            </div>
            <div className="card-surface p-4">
              <div className="text-xs text-gray-500 mb-1">Total predicted spend</div>
              <div className="text-2xl font-bold">
                {fmtSpend(totalPredictedSpend)}
              </div>
            </div>
            <div className="card-surface p-4">
              <div className="text-xs text-gray-500 mb-1">Grade distribution</div>
              <div className="flex gap-1.5 mt-1">
                {(["A", "B", "C", "D", "F"] as Grade[]).map((g) => (
                  <span
                    key={g}
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${GRADE_COLORS[g]}`}
                  >
                    {g}: {gradeDistribution[g] || 0}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sort Controls + Download */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              {(["score", "spend", "risk"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                    sortBy === s
                      ? "bg-beetroot/15 text-beetroot-light"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {s === "score" ? "Score" : s === "spend" ? "Predicted spend" : "Churn risk"}
                </button>
              ))}
            </div>
            <button
              onClick={downloadCSV}
              className="btn-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>

          {/* Results Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-gray-400 text-xs">
                    <th className="text-left p-4 font-medium">Brand</th>
                    <th className="text-left p-4 font-medium">Industry</th>
                    <th className="text-center p-4 font-medium">Score</th>
                    <th className="text-center p-4 font-medium">Grade</th>
                    <th className="text-center p-4 font-medium">Churn risk</th>
                    <th className="text-right p-4 font-medium">Predicted spend</th>
                    <th className="text-center p-4 font-medium">Red flags</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          <BrandLogo domain={r.enrichment.website} name={r.brand} size={22} />
                          {r.brand}
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">
                        {r.enrichment.industry}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-beetroot"
                              style={{ width: `${r.totalScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs">
                            {r.totalScore}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${GRADE_COLORS[r.grade]}`}
                        >
                          {r.grade}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs risk-${r.churnRisk}`}
                        >
                          {r.churnRisk}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-xs">
                        {fmtSpend(r.predictedAnnualSpend.mid)}
                      </td>
                      <td className="p-4 text-center">
                        {r.redFlags.length > 0 ? (
                          <span className="flex items-center justify-center gap-1 text-red-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="text-xs">{r.redFlags.length}</span>
                          </span>
                        ) : (
                          <span className="text-emerald-500 text-xs">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
