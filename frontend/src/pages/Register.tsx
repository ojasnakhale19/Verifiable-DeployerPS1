import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Info, ArrowRight } from "lucide-react";
import { deploymentsApi, type Deployment, ApiError } from "../api";
import FormField from "../components/FormField";
import StatusCard from "../components/StatusCard";
import CheckRow from "../components/CheckRow";

const EMPTY = {
  artifactPath: "",
  bundlePath: "",
  version: "",
  address: "",
  rpcUrl: "",
  expectedSigner: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const run = async () => {
    setApiError(null);
    setLoading(true);
    setResult(null);
    setBusy(true);
    try {
      const r = await deploymentsApi.register({
        artifactPath: form.artifactPath,
        bundlePath: form.bundlePath,
        version: form.version,
        address: form.address,
        rpcUrl: form.rpcUrl || undefined,
        expectedSigner: form.expectedSigner || undefined,
      });
      setResult(r);
    } catch (e) {
      if (e instanceof ApiError) {
        setApiError(e.message);
      } else {
        setApiError("Backend unreachable");
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <PlusCircle size={22} className="text-[var(--accent-blue)]" />
          Register Deployment
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Verify all checks and persist a trusted deployment record in one step.
        </p>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--accent-yellow)]/10 border border-[var(--accent-yellow)]/20 text-sm text-[var(--text-secondary)]">
        <Info size={15} className="text-[var(--accent-yellow)] mt-0.5 shrink-0" />
        <p>
          Registration is permanent for the lifecycle of this server session. A deployment can
          only be registered <strong>once</strong> per contract address + chain ID pair.
        </p>
      </div>

      {result ? (
        /* ── Success view ── */
        <div className="space-y-4 slide-up">
          <StatusCard verified={true} />

          <div className="card">
            <p className="section-title">Registered deployment</p>
            <div className="space-y-2">
              <CheckRow label="Audit approved" state={result.auditApproved ? "pass" : "fail"} />
              <CheckRow label="Sigstore verified" state={result.sigstoreVerified ? "pass" : "fail"} />
              <CheckRow label="Bytecode verified" state={result.bytecodeVerified ? "pass" : "fail"} />
            </div>
          </div>

          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="label">Contract address</p>
                <p className="font-mono text-xs text-[var(--text-primary)] break-all">
                  {result.contractAddress}
                </p>
              </div>
              <div>
                <p className="label">Version</p>
                <p className="text-[var(--text-primary)]">{result.version}</p>
              </div>
              <div>
                <p className="label">Chain ID</p>
                <p className="text-[var(--text-primary)]">{result.chainId} (Sepolia)</p>
              </div>
              <div>
                <p className="label">Registered at</p>
                <p className="text-[var(--text-primary)]">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="label">Signer identity</p>
              <p className="hash-text">{result.signerIdentity}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => { setResult(null); setForm(EMPTY); }}
            >
              Register another
            </button>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => navigate(`/deployments/${result.contractAddress}`)}
            >
              View record <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* ── Form view ── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <p className="section-title">Deployment inputs</p>

            <FormField
              label="Artifact path"
              hint="Absolute server path to the compiled JSON artifact"
              placeholder="/app/artifacts/MyContract.json"
              value={form.artifactPath}
              onChange={set("artifactPath")}
            />
            <FormField
              label="Bundle path"
              hint="Absolute server path to the Cosign .sigstore / .bundle file"
              placeholder="/app/artifacts/MyContract.json.bundle"
              value={form.bundlePath}
              onChange={set("bundlePath")}
            />
            <FormField
              label="Version"
              hint="Must match an existing audit approval"
              placeholder="1.0.0"
              value={form.version}
              onChange={set("version")}
            />
            <FormField
              label="Contract address"
              hint="0x-prefixed deployed address on Sepolia"
              placeholder="0xAbCd…"
              value={form.address}
              onChange={set("address")}
            />

            <div className="divider" />
            <p className="section-title">Optional overrides</p>

            <FormField
              label="RPC URL"
              placeholder="https://rpc.ankr.com/eth_sepolia"
              value={form.rpcUrl}
              onChange={set("rpcUrl")}
            />
            <FormField
              label="Expected signer"
              placeholder="github-actions@…"
              value={form.expectedSigner}
              onChange={set("expectedSigner")}
            />

            <button
              className="btn-primary w-full mt-2"
              onClick={run}
              disabled={busy || !form.artifactPath || !form.bundlePath || !form.version || !form.address}
            >
              {busy ? "VERIFYING & REGISTERING…" : "VERIFY & REGISTER"}
            </button>

            {apiError && (
              <p className="text-sm text-[var(--accent-red)] bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 rounded-lg px-3 py-2">
                {apiError}
              </p>
            )}
          </div>

          {/* What happens explanation */}
          <div className="card self-start">
            <p className="section-title">What this does</p>
            <ol className="space-y-3">
              {[
                {
                  n: "1",
                  title: "Hash the artifact",
                  desc: "SHA-256 of the compiled JSON and extracted bytecodes",
                },
                {
                  n: "2",
                  title: "Check audit approval",
                  desc: "Looks up (artifactHash, version) in the approval store",
                },
                {
                  n: "3",
                  title: "Verify Sigstore bundle",
                  desc: "Runs cosign verify-blob against the trusted OIDC issuer",
                },
                {
                  n: "4",
                  title: "Match on-chain bytecode",
                  desc: "Calls eth_getCode on Sepolia and hashes the result",
                },
                {
                  n: "5",
                  title: "Persist if all pass",
                  desc: "Saves a TRUSTED record. Returns 422 if any check fails.",
                },
              ].map((item) => (
                <li key={item.n} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
        </div>
      )}

      {loading && !result && (
        <StatusCard verified={null} />
      )}
    </div>
  );
}
