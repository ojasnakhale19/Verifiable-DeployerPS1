import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface HashDisplayProps {
  label: string;
  value: string;
  highlight?: "match" | "mismatch" | "neutral";
}

export default function HashDisplay({ label, value, highlight = "neutral" }: HashDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const borderColor =
    highlight === "match"
      ? "border-[var(--accent-green)]/40 bg-[var(--accent-green)]/5"
      : highlight === "mismatch"
      ? "border-[var(--accent-red)]/40 bg-[var(--accent-red)]/5"
      : "border-[var(--border)]";

  return (
    <div className={`rounded-lg border p-3 ${borderColor} transition-colors`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">
          {label}
        </span>
        <button
          onClick={copy}
          className="text-[var(--text-muted)] hover:text-[var(--accent-green)] transition-colors p-0.5 rounded"
          title="Copy to clipboard"
        >
          {copied ? <Check size={12} className="text-[var(--accent-green)]" /> : <Copy size={12} />}
        </button>
      </div>
      <p className="hash-text">
        {value || <span className="italic opacity-50">unavailable</span>}
      </p>
    </div>
  );
}
