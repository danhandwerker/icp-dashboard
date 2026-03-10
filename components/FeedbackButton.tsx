"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, ThumbsUp, ThumbsDown, Send, Loader2, CheckCircle2 } from "lucide-react";

type Tab = "general" | "brand_critique";

const BRAND_ISSUE_OPTIONS = [
  "Industry categorization",
  "Score too high",
  "Score too low",
  "Wrong comparables",
  "Missing red flag",
  "Other",
];

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-24 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all animate-fade-in ${
        type === "success"
          ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
          : "bg-red-950/90 border-red-500/30 text-red-300"
      }`}
    >
      {type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  );
}

export default function FeedbackButton({
  userEmail,
  currentBrand,
}: {
  userEmail: string;
  currentBrand?: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("general");

  // General tab state
  const [generalMessage, setGeneralMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  // Brand critique tab state
  const [brandName, setBrandName] = useState(currentBrand || "");
  const [brandCategory, setBrandCategory] = useState("");
  const [brandMessage, setBrandMessage] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Keep brandName in sync if the parent page scores a new brand
  useEffect(() => {
    if (currentBrand) setBrandName(currentBrand);
  }, [currentBrand]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Trap focus / close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function resetForm() {
    setGeneralMessage("");
    setRating(null);
    setBrandName(currentBrand || "");
    setBrandCategory("");
    setBrandMessage("");
  }

  async function handleSubmit() {
    const message = tab === "general" ? generalMessage : brandMessage;
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const payload =
        tab === "general"
          ? { type: "general", rating: rating ?? undefined, message }
          : { type: "brand_critique", brand: brandName, category: brandCategory, message };

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setOpen(false);
      resetForm();
      showToast("Feedback sent. Thanks!", "success");
    } catch {
      showToast("Failed to send feedback. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    tab === "general" ? generalMessage.trim().length > 0 : brandMessage.trim().length > 0;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: "#C20075",
          boxShadow: "0 4px 20px rgba(194, 0, 117, 0.5)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 6px 28px rgba(194, 0, 117, 0.7)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 4px 20px rgba(194, 0, 117, 0.5)";
        }}
      >
        <MessageSquare className="w-5 h-5 text-white" />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-6 sm:items-center sm:justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={handleBackdrop}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl animate-fade-in"
            style={{ background: "#181c28" }}
            role="dialog"
            aria-modal="true"
            aria-label="Feedback"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8">
              <div>
                <h2 className="text-base font-semibold">Send Feedback</h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Sending as{" "}
                  <span className="text-white/60">{userEmail}</span>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/40 hover:text-white/80 transition-colors rounded-lg p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/8">
              {(["general", "brand_critique"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    tab === t
                      ? "text-white border-b-2 border-beetroot"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  style={tab === t ? { borderBottomColor: "#C20075" } : {}}
                >
                  {t === "general" ? "General" : "Brand Score Critique"}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {tab === "general" ? (
                <>
                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2">
                      Rating (optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setRating(rating === 1 ? null : 1)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          rating === 1
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Helpful
                      </button>
                      <button
                        onClick={() => setRating(rating === 0 ? null : 0)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          rating === 0
                            ? "bg-red-500/20 border-red-500/40 text-red-400"
                            : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        Not helpful
                      </button>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      What&apos;s on your mind?
                    </label>
                    <textarea
                      value={generalMessage}
                      onChange={(e) => setGeneralMessage(e.target.value)}
                      placeholder="Tell me what's working, what's broken, what you'd change..."
                      rows={4}
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:ring-2 border border-white/10 focus:border-transparent"
                      style={{
                        background: "#1e2235",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(194, 0, 117, 0.4)";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "";
                        e.currentTarget.style.borderColor = "";
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Brand name */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Peloton"
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none"
                      style={{ background: "#1e2235" }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(194, 0, 117, 0.4)";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "";
                        e.currentTarget.style.borderColor = "";
                      }}
                    />
                  </div>

                  {/* Issue category */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      What&apos;s wrong?
                    </label>
                    <select
                      value={brandCategory}
                      onChange={(e) => setBrandCategory(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white border border-white/10 focus:outline-none appearance-none cursor-pointer"
                      style={{ background: "#1e2235" }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(194, 0, 117, 0.4)";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "";
                        e.currentTarget.style.borderColor = "";
                      }}
                    >
                      <option value="" className="bg-[#1e2235]">Select an issue...</option>
                      {BRAND_ISSUE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#1e2235]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Details */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Details
                    </label>
                    <textarea
                      value={brandMessage}
                      onChange={(e) => setBrandMessage(e.target.value)}
                      placeholder="Describe what's wrong with the score or output..."
                      rows={3}
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 resize-none border border-white/10 focus:outline-none"
                      style={{ background: "#1e2235" }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(194, 0, 117, 0.4)";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "";
                        e.currentTarget.style.borderColor = "";
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
