"use client";

import { useEffect, useRef, useState } from "react";

const LOADING_MESSAGES = [
  "Analyzing brand signals...",
  "Mapping to ICP dimensions...",
  "Evaluating offer strength...",
  "Checking conversion cycle patterns...",
  "Assessing data integration readiness...",
  "Running churn risk model...",
  "Projecting annual spend range...",
  "Finding comparable advertisers...",
  "Generating meeting brief...",
  "Finalizing score...",
];

function WaveformBar({ delay }: { delay: number }) {
  return (
    <div
      className="w-1 rounded-full"
      style={{
        background: "var(--color-beetroot)",
        animation: "waveform 1.1s ease-in-out infinite",
        animationDelay: `${delay}s`,
        height: "24px",
        opacity: 0.7,
      }}
    />
  );
}

export default function LoadingState({ message }: { message?: string }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const displayMessage = message ?? LOADING_MESSAGES[msgIndex];

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-6">
        {/* Waveform animation */}
        <div className="flex items-center gap-1" style={{ height: 40 }}>
          {Array.from({ length: 9 }, (_, i) => (
            <WaveformBar key={i} delay={i * 0.12} />
          ))}
        </div>

        {/* Animated status message */}
        <p
          key={msgIndex}
          className="text-sm text-white/50 animate-fade-in"
          style={{ minHeight: "1.25rem" }}
        >
          {displayMessage}
        </p>

        {/* Skeleton dashboard layout */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left col — score card skeleton */}
          <div className="card p-6 flex flex-col gap-4">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-40 rounded" />
            <div className="flex items-center gap-6">
              {/* Circle gauge skeleton */}
              <div
                className="skeleton shrink-0 rounded-full"
                style={{ width: 120, height: 120 }}
              />
              <div className="flex flex-col gap-3 flex-1">
                <div className="skeleton h-10 w-16 rounded" />
                <div className="skeleton h-6 w-28 rounded-full" />
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
            </div>
            <div className="card-surface p-4">
              <div className="skeleton h-3 w-36 rounded mb-3" />
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="skeleton h-3 w-8 rounded" />
                    <div className="skeleton h-5 w-16 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle col — dimensions skeleton */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="card-surface p-4 flex flex-col gap-3">
                <div className="flex justify-between">
                  <div className="skeleton h-4 w-28 rounded" />
                  <div className="skeleton h-4 w-10 rounded" />
                </div>
                <div className="skeleton h-2 w-full rounded-full" />
                <div className="skeleton h-8 w-full rounded-lg" />
                <div className="skeleton h-3 w-4/5 rounded" />
              </div>
            ))}
          </div>

          {/* Right col — flags + recommendations skeleton */}
          <div className="flex flex-col gap-3">
            <div className="card p-5 flex flex-col gap-3">
              <div className="skeleton h-4 w-20 rounded" />
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="skeleton h-4 w-36 rounded mb-2" />
                  <div className="skeleton h-3 w-full rounded mb-1" />
                  <div className="skeleton h-3 w-3/4 rounded" />
                </div>
              ))}
            </div>
            <div className="card p-5 flex flex-col gap-3">
              <div className="skeleton h-4 w-24 rounded" />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="skeleton h-4 w-32 rounded mb-2" />
                  <div className="skeleton h-3 w-full rounded mb-1" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
