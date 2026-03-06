"use client";

import { useState, useCallback } from "react";
import { Copy, Download, Check, FileText } from "lucide-react";

interface MeetingBriefProps {
  brief: string;
  brand: string;
}

function markdownToHtml(md: string): string {
  return md
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-white mb-3 mt-0">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-semibold uppercase tracking-widest text-white/50 mt-6 mb-2">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-white/80 mt-4 mb-1">$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Bullet list items
    .replace(/^- \*\*(.+?)\*\*: (.+)$/gm, '<li class="flex gap-2 text-sm text-white/70 mb-1.5"><span class="text-beetroot mt-0.5 shrink-0" style="color:#C20075">•</span><span><strong class="text-white font-medium">$1</strong>: $2</span></li>')
    .replace(/^- (.+)$/gm, '<li class="flex gap-2 text-sm text-white/70 mb-1.5"><span class="shrink-0 mt-0.5" style="color:#C20075">•</span><span>$1</span></li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li[\s\S]+?<\/li>\n?)+/g, (m) => `<ul class="space-y-0.5 my-2 ml-1">${m}</ul>`)
    // Empty lines become spacers
    .replace(/\n\n/g, '<div class="h-2"></div>')
    // Single newlines
    .replace(/\n/g, "");
}

export default function MeetingBrief({ brief, brand }: MeetingBriefProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = brief;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [brief]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([brief], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brand.replace(/\s+/g, "-")}-meeting-brief.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [brief, brand]);

  const html = markdownToHtml(brief);

  return (
    <div className="card p-5 animate-fade-in delay-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-white/40" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">
            Meeting Brief
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
          >
            <Download size={12} />
            Download
          </button>
        </div>
      </div>

      {/* Brief content */}
      <div
        className="rounded-xl p-5 overflow-auto max-h-[480px]"
        style={{
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "var(--font-archivo)",
          lineHeight: "1.65",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Raw markdown toggle */}
      <details className="group">
        <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50 transition-colors select-none list-none flex items-center gap-1.5">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            className="transition-transform group-open:rotate-90"
          >
            <path d="M3 2l4 3-4 3V2z" />
          </svg>
          View raw markdown
        </summary>
        <pre
          className="mt-2 p-4 rounded-lg text-xs text-white/50 overflow-auto max-h-60 leading-relaxed"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.05)",
            fontFamily: "var(--font-roboto-mono)",
          }}
        >
          {brief}
        </pre>
      </details>
    </div>
  );
}
