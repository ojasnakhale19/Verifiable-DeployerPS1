import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  List,
  ShieldCheck,
  ShieldX,
  RefreshCw,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Search,
} from "lucide-react";
import { deploymentsApi, type Deployment } from "../api";
import CheckRow from "../components/CheckRow";
import HashDisplay from "../components/HashDisplay";

// ── List view ────────────────────────────────────────────────────────────────

export function DeploymentsList() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    setError(null);
    deploymentsApi
      .list()
      .then(setDeployments)
      .catch(() => setError("Could not reach backend"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = deployments.filter(
    (d) =>
      filter === "" ||
      d.contractAddress.toLowerCase().includes(filter.toLowerCase()) ||
      d.version.includes(filter) ||
      d.signerIdentity.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <List size={22} className="text-[var(--text-muted)]" />
            Deployments
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {loading ? "Loading…" : `${deployments.length} registered deployment${deployments.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-1.5 py-2 px-3 text-xs">
            <RefreshCw size={13} />
            Refresh
          </button>
          <Link to="/register" className="btn-primary text-xs py-2 px-3">
            + Register
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          className="input-field pl-9 text-sm"
          placeholder="Filter by address, version, or signer…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="card text-center py-10 text-[var(--text-muted)] text-sm">
          <RefreshCw size={20} className="mx-auto mb-2 spin-slow" />
          Loading deployments…
        </div>
      ) : error ? (
        <div className="card border-[var(--accent-yellow)]/40 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <AlertTriangle size={18} className="text-[var(--accent-yellow)] shrink-0" />
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Make sure the backend is running on port 3000.
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          {filter ? (
            <>
              <Search size={28} className="mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">No results for "{filter}"</p>
              <button
                className="btn-secondary mt-3 text-xs py-1.5 px-3"
                onClick={() => setFilter("")}
              >
                Clear filter
              </button>
            </>
          ) : (
            <>
              <ShieldX size={28} className="mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">No deployments registered yet.</p>
              <Link to="/register" className="btn-primary inline-block mt-4 text-xs px-4 py-2">
                Register first deployment
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d) => (
            <DeploymentCard key={d.contractAddress} d={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function DeploymentCard({ d }: { d: Deployment }) {
  const navigate = useNavigate();
  const trusted = d.status === "TRUSTED";

  return (
    <button
      onClick={() => navigate(`/deployments/${d.contractAddress}`)}
      className="w-full text-left card-hover flex items-center gap-4 group"
    >
      <div
        className={`p-2 rounded-lg shrink-0 ${
          trusted
            ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]"
            : "bg-[var(--accent-red)]/15 text-[var(--accent-red)]"
        }`}
      >
        {trusted ? <ShieldCheck size={18} /> : <ShieldX size={18} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="text-sm font-mono text-[var(--text-primary)] truncate">
            {d.contractAddress}
          </p>
          <span className={`badge shrink-0 ${trusted ? "badge-green" : "badge-red"}`}>
            {d.status}
          </span>
          <span className="badge badge-muted shrink-0">v{d.version}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(d.timestamp).toLocaleString()}
          </span>
          <span>Chain {d.chainId}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1.5 shrink-0">
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

      <ArrowLeft
        size={14}
        className="text-[var(--text-muted)] shrink-0 rotate-180 group-hover:text-[var(--accent-green)] transition-colors"
      />
    </button>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────

export function DeploymentDetail() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [dep, setDep] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    deploymentsApi
      .get(address)
      .then(setDep)
      .catch((e) => setError(e?.message ?? "Not found"))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) {
    return (
      <div className="card text-center py-10 text-[var(--text-muted)] text-sm">
        <RefreshCw size={20} className="mx-auto mb-2 spin-slow" />
        Loading deployment…
      </div>
    );
  }

  if (error || !dep) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/deployments")}
          className="btn-secondary flex items-center gap-2 text-xs py-2 px-3"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div className="card border-[var(--accent-red)]/40 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <ShieldX size={18} className="text-[var(--accent-red)] shrink-0" />
          <p>{error ?? "Deployment not found"}</p>
        </div>
      </div>
    );
  }

  const trusted = dep.status === "TRUSTED";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/deployments")}
          className="btn-secondary flex items-center gap-2 text-xs py-2 px-3"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-mono leading-tight">
            {dep.contractAddress}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`badge ${trusted ? "badge-green" : "badge-red"}`}>
              {dep.status}
            </span>
            <span className="badge badge-muted">v{dep.version}</span>
            <span className="badge badge-blue">Chain {dep.chainId}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification checks */}
        <div className="card">
          <p className="section-title">Verification checks</p>
          <div className="space-y-2">
            <CheckRow label="Audit approved" state={dep.auditApproved ? "pass" : "fail"} />
            <CheckRow label="Sigstore verified" state={dep.sigstoreVerified ? "pass" : "fail"} />
            <CheckRow label="Bytecode verified" state={dep.bytecodeVerified ? "pass" : "fail"} />
          </div>

          {dep.reasons.length > 0 && (
            <div className="mt-4">
              <p className="section-title">Failure reasons</p>
              <ul className="space-y-1.5">
                {dep.reasons.map((r, i) => (
                  <li
                    key={i}
                    className="text-xs text-[var(--text-secondary)] bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20 rounded px-3 py-2"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="card space-y-4">
          <p className="section-title">Deployment metadata</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="label">Version</p>
              <p className="text-[var(--text-primary)]">{dep.version}</p>
            </div>
            <div>
              <p className="label">Chain</p>
              <p className="text-[var(--text-primary)]">{dep.chainId} (Sepolia)</p>
            </div>
            <div className="col-span-2">
              <p className="label">Registered at</p>
              <p className="text-[var(--text-primary)]">
                {new Date(dep.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <div>
            <p className="label">Signer identity</p>
            <p className="hash-text">{dep.signerIdentity || "—"}</p>
          </div>
          {dep.rekorEntry && (
            <div>
              <p className="label">Rekor entry</p>
              <p className="hash-text">{dep.rekorEntry}</p>
            </div>
          )}
        </div>
      </div>

      {/* Hashes */}
      <div className="card space-y-3">
        <p className="section-title">Cryptographic hashes</p>
        <HashDisplay label="Artifact SHA-256" value={dep.artifactHash} />
        <HashDisplay label="Runtime bytecode SHA-256" value={dep.runtimeBytecodeHash} />
      </div>
    </div>
  );
}
