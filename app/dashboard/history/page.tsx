"use client";

import { useState, useEffect } from "react";
import { SavedScore, Grade } from "@/lib/types";
import { Trash2, ExternalLink, Clock } from "lucide-react";

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function HistoryPage() {
  const [scores, setScores] = useState<SavedScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scores")
      .then((r) => r.json())
      .then((data) => {
        setScores(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/scores?id=${id}`, { method: "DELETE" });
    setScores((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Saved scores
        </h1>
        <p className="text-sm text-gray-400">
          All previously saved ICP scores across your team. Track how prospects
          evolve over time.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : scores.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No saved scores yet.</p>
          <p className="text-xs text-gray-600 mt-1">
            Score a brand and click Save to start tracking.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-400 text-xs">
                <th className="text-left p-4 font-medium">Brand</th>
                <th className="text-center p-4 font-medium">Score</th>
                <th className="text-center p-4 font-medium">Grade</th>
                <th className="text-center p-4 font-medium">Risk</th>
                <th className="text-right p-4 font-medium">Predicted spend</th>
                <th className="text-left p-4 font-medium">Scored by</th>
                <th className="text-right p-4 font-medium">When</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 font-medium">{s.brand}</td>
                  <td className="p-4 text-center font-mono text-xs">
                    {s.totalScore}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${GRADE_COLORS[s.grade]}`}
                    >
                      {s.grade}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs risk-${s.churnRisk}`}>
                      {s.churnRisk}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-xs">
                    {fmtSpend(s.predictedSpendMid)}
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {s.userEmail.split("@")[0]}
                  </td>
                  <td className="p-4 text-right text-gray-500 text-xs">
                    {timeAgo(s.createdAt)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
