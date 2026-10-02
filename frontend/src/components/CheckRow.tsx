import { Check, X, Minus } from "lucide-react";

type CheckState = "pass" | "fail" | "unknown";

interface CheckRowProps {
  label: string;
  state: CheckState;
  detail?: string;
}

export default function CheckRow({ label, state, detail }: CheckRowProps) {
  const icon =
    state === "pass" ? (
      <Check size={13} className="text-[var(--accent-green)]" />
    ) : state === "fail" ? (
      <X size={13} className="text-[var(--accent-red)]" />
    ) : (
      <Minus size={13} className="text-[var(--text-muted)]" />
    );

  const bg =
    state === "pass"
      ? "bg-[var(--accent-green)]/10 border-[var(--accent-green)]/20"
      : state === "fail"
      ? "bg-[var(--accent-red)]/10 border-[var(--accent-red)]/20"
      : "bg-white/5 border-[var(--border)]";

  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${bg}`}>
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-[var(--text-muted)]">{detail}</span>}
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            state === "pass"
              ? "bg-[var(--accent-green)]/20"
              : state === "fail"
              ? "bg-[var(--accent-red)]/20"
              : "bg-white/10"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
