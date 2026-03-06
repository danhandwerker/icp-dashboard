"use client";

import { useState, useRef, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";

interface BrandInputProps {
  onSubmit: (brand: string) => void;
  isLoading?: boolean;
}

export default function BrandInput({ onSubmit, isLoading = false }: BrandInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || isLoading) return;
    onSubmit(trimmed);
  }, [value, isLoading, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xl mx-auto animate-slide-up px-4">
      {/* Input + button group */}
      <div className="w-full flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.3)" }}
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Capital One, DoorDash, HelloFresh..."
            disabled={isLoading}
            className="input-brand w-full pl-10 pr-4 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || value.trim().length === 0}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Scoring...
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 2a5 5 0 1 0 0 10A5 5 0 0 0 7 2z" />
                <path d="M7 5v4M5 7h4" />
              </svg>
              Score this brand
            </>
          )}
        </button>
      </div>

      {/* Loading message */}
      {isLoading && (
        <p className="text-xs text-white/40 animate-pulse">
          AI is enriching brand data and computing ICP score...
        </p>
      )}
    </div>
  );
}
