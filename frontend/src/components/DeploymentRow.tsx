import { useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldX, ChevronRight, Clock } from "lucide-react";
import type { Deployment } from "../api";

interface DeploymentRowProps {
  deployment: Deployment;
}

export default function DeploymentRow({ deployment: d }: DeploymentRowProps) {
  const navigate = useNavigate();
  const trusted = d.status === "TRUSTED";
  const date = new Date(d.timestamp).toLocaleString();

  return (
    <button
      onClick={() => navigate(`/deployments/${d.contractAddress}`)}
      className="w-full text-left card-hover flex items-center gap-4 cursor-pointer group"
    >
      {/* Icon */}
      <div
        className={`p-2 rounded-lg shrink-0 ${
          trusted
            ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]"
            : "bg-[var(--accent-red)]/15 text-[var(--accent-red)]"
        }`}
      >
        {trusted ? <ShieldCheck size={20} /> : <ShieldX size={20} />}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-mono text-[var(--text-primary)] truncate">
            {d.contractAddress}
          </p>
          <span
            className={`badge shrink-0 ${trusted ? "badge-green" : "badge-red"}`}
          >
            {d.status}
          </span>
          <span className="badge badge-muted shrink-0">v{d.version}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {date}
          </span>
          <span>Chain {d.chainId}</span>
          {d.signerIdentity && (
            <span className="truncate max-w-xs">Signer: {d.signerIdentity}</span>
          )}
        </div>
      </div>

      {/* Checks summary */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        {[
          { label: "Audit", ok: d.auditApproved },
          { label: "Sig", ok: d.sigstoreVerified },
          { label: "Bytecode", ok: d.bytecodeVerified },
        ].map(({ label, ok }) => (
          <div
            key={label}
            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
              ok
                ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]"
                : "bg-[var(--accent-red)]/15 text-[var(--accent-red)]"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <ChevronRight
        size={16}
        className="text-[var(--text-muted)] shrink-0 group-hover:text-[var(--text-secondary)] transition-colors"
      />
    </button>
  );
}
