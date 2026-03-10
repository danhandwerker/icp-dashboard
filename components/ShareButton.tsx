"use client";

import { useState, useEffect, useRef } from "react";
import { Share2, Send, Check, Loader2, X } from "lucide-react";
import { DimensionScore, Grade, ChurnRisk } from "@/lib/types";

interface ShareButtonProps {
  brand: string;
  scorePercent: number;
  grade: Grade;
  churnRisk: ChurnRisk;
  predictedSpend: { low: number; mid: number; high: number };
  redFlagCount: number;
  dimensions: DimensionScore[];
}

const LOCALSTORAGE_KEY = "icp_gchat_space_id";

function parseSpaceId(input: string): string {
  const trimmed = input.trim();
  // Handle full GChat URL: https://chat.google.com/room/AAAA... or /space/AAAA...
  const urlMatch = trimmed.match(/chat\.google\.com\/(?:room|space)\/([A-Za-z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];
  // Handle "spaces/AAAA..." prefix
  const prefixMatch = trimmed.match(/^spaces\/(.+)/);
  if (prefixMatch) return prefixMatch[1];
  // Assume it's a raw space ID already
  return trimmed;
}

export default function ShareButton({
  brand,
  scorePercent,
  grade,
  churnRisk,
  predictedSpend,
  redFlagCount,
  dimensions,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [spaceInput, setSpaceInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Restore last-used space ID from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY);
      if (saved) setSpaceInput(saved);
    } catch {
      // ignore
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  async function handleShare() {
    const spaceId = parseSpaceId(spaceInput);
    if (!spaceId) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      localStorage.setItem(LOCALSTORAGE_KEY, spaceInput.trim());
    } catch {
      // ignore
    }

    try {
      const res = await fetch("/api/share-gchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId,
          brand,
          scorePercent,
          grade,
          churnRisk,
          predictedSpend,
          redFlagCount,
          dimensions: dimensions.map((d) => ({
            name: d.name,
            score: d.score,
            maxScore: d.maxScore,
            active: d.active !== false,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to share");

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setOpen(false);
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const canShare = spaceInput.trim().length > 0 && status === "idle";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className={`btn-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
          open ? "border-beetroot/40 text-white/90" : ""
        }`}
        aria-label="Share to Google Chat"
        aria-expanded={open}
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-white/10 shadow-2xl animate-fade-in"
          style={{ background: "#181c28" }}
          role="dialog"
          aria-label="Share to Google Chat"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Share to Google Chat</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white/80 transition-colors rounded p-0.5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                GChat space URL or ID
              </label>
              <input
                type="text"
                value={spaceInput}
                onChange={(e) => setSpaceInput(e.target.value)}
                placeholder="Paste GChat space URL or ID"
                className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none"
                style={{ background: "#1e2235" }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(194, 0, 117, 0.4)";
                  e.currentTarget.style.borderColor = "transparent";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canShare) handleShare();
                }}
                autoFocus
                disabled={status === "loading" || status === "success"}
              />
              <p className="text-xs text-white/30 mt-1">
                e.g. chat.google.com/room/AAAA... or a raw space ID
              </p>
            </div>

            {/* Error message */}
            {status === "error" && errorMsg && (
              <p className="text-xs text-red-400">{errorMsg}</p>
            )}

            {/* Share button */}
            <button
              onClick={handleShare}
              disabled={!canShare}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                status === "success"
                  ? { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }
                  : { background: "#C20075", color: "#fff", boxShadow: "0 2px 12px rgba(194,0,117,0.35)" }
              }
            >
              {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === "success" && <Check className="w-4 h-4" />}
              {status === "idle" && <Send className="w-4 h-4" />}
              {status === "error" && <Send className="w-4 h-4" />}
              {status === "loading"
                ? "Sending..."
                : status === "success"
                ? "Shared!"
                : "Send to GChat"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
