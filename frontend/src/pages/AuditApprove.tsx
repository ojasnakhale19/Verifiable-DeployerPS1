import { useState } from "react";
import { ClipboardCheck, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { auditApi, type AuditApproval, ApiError } from "../api";
import FormField from "../components/FormField";

const EMPTY = { auditor: "", artifactHash: "", version: "" };

export default function AuditApprove() {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<AuditApproval | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const hashValid = /^0x[0-9a-fA-F]{64}$/.test(form.artifactHash);

  const submit = async () => {
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const r = await auditApi.approve(form);
      setSuccess(r.approval);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError("Backend unreachable");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <ClipboardCheck size={22} className="text-[var(--accent-yellow)]" />
          Audit Approve
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Record an auditor's approval for a specific artifact hash and version. This is a
          prerequisite for trusted deployment registration.
        </p>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 text-sm text-[var(--text-secondary)]">
        <Info size={15} className="text-[var(--accent-blue)] mt-0.5 shrink-0" />
        <p>
          The artifact hash must be obtained first via the{" "}
          <strong>Artifact Hash</strong> page. Approvals are stored in memory for the server
          session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card space-y-4">
          <p className="section-title">Approval details</p>

          <FormField
            label="Auditor identity"
            hint="Email or identifier of the auditor granting approval"
            placeholder="auditor@example.com"
            value={form.auditor}
            onChange={set("auditor")}
          />

          <div>
            <label className="label">Artifact SHA-256</label>
            <p className="text-xs text-[var(--text-muted)] mb-2 -mt-1">
              Must be exactly <code className="font-mono px-1 py-0.5 bg-white/10 rounded text-[10px]">0x</code> followed by 64 hex characters
            </p>
            <input
              className={`input-field ${
                form.artifactHash && !hashValid
                  ? "border-[var(--accent-red)]/60 focus:border-[var(--accent-red)] focus:ring-[var(--accent-red)]/20"
                  : ""
              }`}
              placeholder="0xabcdef1234…"
              value={form.artifactHash}
              onChange={set("artifactHash")}
            />
            {form.artifactHash && !hashValid && (
              <p className="text-xs text-[var(--accent-red)] mt-1.5 flex items-center gap-1">
                <AlertTriangle size={11} />
                Invalid format — must be 0x + 64 hex chars
              </p>
            )}
          </div>

          <FormField
            label="Version"
            hint="Semver string that must match the version used during deployment"
            placeholder="1.0.0"
            value={form.version}
            onChange={set("version")}
          />

          <button
            className="btn-primary w-full mt-2"
            onClick={submit}
            disabled={busy || !form.auditor || !hashValid || !form.version}
          >
            {busy ? "SUBMITTING…" : "RECORD APPROVAL"}
          </button>

          {error && (
            <div className="flex items-start gap-2 text-sm text-[var(--accent-red)] bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 rounded-lg px-3 py-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Success / info panel */}
        <div className="space-y-4">
          {success ? (
            <div className="card border-[var(--accent-green)]/40 glow-green slide-up space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-green)]/15">
                  <CheckCircle size={22} className="text-[var(--accent-green)]" />
                </div>
                <div>
                  <p className="font-bold text-[var(--accent-green)]">Approval recorded</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {new Date(success.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="label">Auditor</p>
                  <p className="text-sm text-[var(--text-primary)]">{success.auditor}</p>
                </div>
                <div>
                  <p className="label">Artifact hash</p>
                  <p className="hash-text">{success.artifactHash}</p>
                </div>
                <div>
                  <p className="label">Version</p>
                  <p className="text-sm text-[var(--text-primary)]">{success.version}</p>
                </div>
              </div>

              <button
                className="btn-secondary w-full text-xs"
                onClick={() => { setSuccess(null); setForm(EMPTY); }}
              >
                Record another approval
              </button>
            </div>
          ) : (
            <div className="card self-start">
              <p className="section-title">How audit approval works</p>
              <ol className="space-y-3">
                {[
                  {
                    n: "1",
                    title: "Hash the artifact",
                    desc: 'Use the "Artifact Hash" page to get the SHA-256 of the compiled contract JSON.',
                  },
                  {
                    n: "2",
                    title: "Record the approval",
                    desc: "Submit the auditor identity, hash, and version here.",
                  },
                  {
                    n: "3",
                    title: "Deploy and register",
                    desc: 'The "Register Deployment" step will verify the approval exists before proceeding.',
                  },
                ].map((item) => (
                  <li key={item.n} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent-yellow)]/15 text-[var(--accent-yellow)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.n}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
