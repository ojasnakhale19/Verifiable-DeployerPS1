import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ShieldX,
  Activity,
  ArrowRight,
  FileCode2,
  ClipboardCheck,
  PlusCircle,
  List,
  AlertTriangle,
} from "lucide-react";
import { deploymentsApi, type Deployment } from "../api";

export default function Dashboard() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    deploymentsApi
      .list()
      .then(setDeployments)
      .catch(() => setError("Could not reach backend"))
      .finally(() => setLoading(false));
  }, []);

  const trusted = deployments.filter((d) => d.status === "TRUSTED").length;
  const rejected = deployments.filter((d) => d.status === "REJECTED").length;
  const recent = deployments.slice(0, 3);

  const actions = [
    {
      to: "/verify",
      icon: ShieldCheck,
      label: "Verify Deployment",
      desc: "Run all 4 cryptographic checks without persisting",
      color: "text-[var(--accent-green)]",
      bg: "bg-[var(--accent-green)]/10",
    },
    {
      to: "/register",
      icon: PlusCircle,
      label: "Register Deployment",
      desc: "Verify and persist a trusted deployment record",
      color: "text-[var(--accent-blue)]",
      bg: "bg-[var(--accent-blue)]/10",
    },
    {
      to: "/audit",
      icon: ClipboardCheck,
      label: "Approve Audit",
      desc: "Record an auditor's approval for an artifact",
      color: "text-[var(--accent-yellow)]",
      bg: "bg-[var(--accent-yellow)]/10",
    },
    {
      to: "/artifact",
      icon: FileCode2,
      label: "Hash Artifact",
      desc: "Compute SHA-256 hashes of a compiled artifact",
      color: "text-[var(--text-secondary)]",
      bg: "bg-white/5",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Sepolia deployment verification pipeline
        </p>
      </div>

      {/* Pipeline steps */}
      <div className="card">
        <p className="section-title">Verification pipeline</p>
        <div className="flex items-center gap-0 flex-wrap">
          {[
            { step: "01", label: "Artifact Hash", sub: "SHA-256 of compiled JSON" },
            { step: "02", label: "Audit Approval", sub: "Auditor pre-approval" },
            { step: "03", label: "Sigstore / Cosign", sub: "Keyless bundle verify" },
            { step: "04", label: "Bytecode Match", sub: "eth_getCode on Sepolia" },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex items-center">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-white/5 border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--accent-green)] font-mono">
                  {item.step}
                </span>
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{item.sub}</p>
                </div>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight size={14} className="text-[var(--text-muted)] mx-1 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="section-title">Total</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {loading ? "—" : deployments.length}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Registered deployments</p>
        </div>
        <div className="card">
          <p className="section-title">Trusted</p>
          <p className="text-3xl font-bold text-[var(--accent-green)]">
            {loading ? "—" : trusted}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">All checks passed</p>
        </div>
        <div className="card">
          <p className="section-title">Rejected</p>
          <p className="text-3xl font-bold text-[var(--accent-red)]">
            {loading ? "—" : rejected}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">One or more checks failed</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="section-title">Quick actions</p>
        <div className="grid grid-cols-2 gap-3">
          {actions.map(({ to, icon: Icon, label, desc, color, bg }) => (
            <Link key={to} to={to} className="card-hover group">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${bg} shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-green)] transition-colors">
                    {label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent deployments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">Recent deployments</p>
          <Link
            to="/deployments"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-green)] flex items-center gap-1 transition-colors"
          >
            <List size={12} /> View all
          </Link>
        </div>

        {loading ? (
          <div className="card text-center text-[var(--text-muted)] text-sm py-8">
            <Activity size={20} className="mx-auto mb-2 spin-slow" />
            Loading…
          </div>
        ) : error ? (
          <div className="card border-[var(--accent-yellow)]/40 text-sm text-[var(--text-secondary)] flex items-center gap-2">
            <AlertTriangle size={16} className="text-[var(--accent-yellow)] shrink-0" />
            {error} — start the backend with{" "}
            <code className="font-mono text-xs px-1.5 py-0.5 bg-white/10 rounded">npm run dev</code>
          </div>
        ) : recent.length === 0 ? (
          <div className="card text-center py-10">
            <ShieldX size={28} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">No deployments registered yet</p>
            <Link to="/register" className="btn-primary inline-block mt-4 text-xs px-4 py-2">
              Register first deployment
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((d) => (
              <Link
                key={d.contractAddress}
                to={`/deployments/${d.contractAddress}`}
                className="card-hover flex items-center gap-4 group"
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    d.status === "TRUSTED"
                      ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]"
                      : "bg-[var(--accent-red)]/15 text-[var(--accent-red)]"
                  }`}
                >
                  {d.status === "TRUSTED" ? <ShieldCheck size={16} /> : <ShieldX size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[var(--text-primary)] truncate">
                    {d.contractAddress}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    v{d.version} · {new Date(d.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`badge shrink-0 ${
                    d.status === "TRUSTED" ? "badge-green" : "badge-red"
                  }`}
                >
                  {d.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
