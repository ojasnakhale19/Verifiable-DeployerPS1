import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";

interface StatusCardProps {
  verified: boolean | null; // null = loading
  reasons?: string[];
}

export default function StatusCard({ verified, reasons = [] }: StatusCardProps) {
  if (verified === null) {
    return (
      <div className="card flex items-center gap-4 slide-up">
        <Loader2 size={28} className="text-[var(--accent-green)] spin-slow shrink-0" />
        <div>
          <p className="font-semibold text-[var(--text-primary)]">Running cryptographic checks…</p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card slide-up ${
        verified
          ? "border-[var(--accent-green)]/50 glow-green"
          : "border-[var(--accent-red)]/50 glow-red"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-2 rounded-lg shrink-0 ${
            verified
              ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]"
              : "bg-[var(--accent-red)]/15 text-[var(--accent-red)]"
          }`}
        >
          {verified ? <ShieldCheck size={24} /> : <ShieldX size={24} />}
        </div>
        <div className="min-w-0">
          <p
            className={`text-lg font-bold tracking-wide ${
              verified ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"
            }`}
          >
            {verified ? "TRUSTED" : "NOT TRUSTED"}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {verified
              ? "All cryptographic checks passed. Deployment is verified."
              : `${reasons.length} check${reasons.length !== 1 ? "s" : ""} failed.`}
          </p>
        </div>
      </div>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-2">
          {reasons.map((reason, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20 rounded-lg px-3 py-2"
            >
              <span className="text-[var(--accent-red)] mt-0.5 shrink-0">✗</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
