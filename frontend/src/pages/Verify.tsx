import { useState } from "react";
import { ShieldCheck, Info } from "lucide-react";
import { deploymentsApi, type DeployVerifyResult } from "../api";
import FormField from "../components/FormField";
import StatusCard from "../components/StatusCard";
import HashDisplay from "../components/HashDisplay";
import CheckRow from "../components/CheckRow";

const EMPTY = {
  artifactPath: "",
  bundlePath: "",
  version: "",
  address: "",
  rpcUrl: "",
  expectedSigner: "",
};

export default function Verify() {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DeployVerifyResult | null>(null);
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
      const r = await deploymentsApi.verify({
        artifactPath: form.artifactPath,
        bundlePath: form.bundlePath,
        version: form.version,
        address: form.address,
        rpcUrl: form.rpcUrl || undefined,
        expectedSigner: form.expectedSigner || undefined,
      });
      setResult(r);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Backend unreachable");
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  // Derive per-check state from result
  const checkState = (pass: boolean | undefined) =>
    result == null ? "unknown" : pass ? "pass" : ("fail" as const);

  const auditPassed =
    result != null &&
    !result.reasons?.some((r) =>
      r.toLowerCase().includes("audit"),
    );
  const sigPassed =
    result != null && result.signature?.verified === true;
  const bytecodePassed =
    result != null &&
    result.artifact?.runtimeBytecodeHash != null &&
    result.actualRuntimeBytecodeHash === result.artifact.runtimeBytecodeHash;
  const addressPassed =
    result != null && !result.reasons?.some((r) => r.toLowerCase().includes("address"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <ShieldCheck size={22} className="text-[var(--accent-green)]" />
          Verify Deployment
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Run all 4 cryptographic checks without persisting a record.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 text-sm text-[var(--text-secondary)]">
        <Info size={15} className="text-[var(--accent-blue)] mt-0.5 shrink-0" />
        <p>
          Paths are resolved on the <strong>server filesystem</strong>. Enter absolute paths as
          they exist on the machine running the backend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card space-y-4">
          <p className="section-title">Inputs</p>

          <FormField
            label="Artifact path"
            hint="Absolute path to the Hardhat/Foundry JSON artifact on the server"
            placeholder="/app/artifacts/MyContract.json"
            value={form.artifactPath}
            onChange={set("artifactPath")}
          />
          <FormField
            label="Bundle path"
            hint="Absolute path to the Cosign .sigstore or .bundle file"
            placeholder="/app/artifacts/MyContract.json.bundle"
            value={form.bundlePath}
            onChange={set("bundlePath")}
          />
          <FormField
            label="Version"
            hint="Semver string matching the audit approval (e.g. 1.0.0)"
            placeholder="1.0.0"
            value={form.version}
            onChange={set("version")}
          />
          <FormField
            label="Contract address"
            hint="0x-prefixed Sepolia contract address"
            placeholder="0xAbCd…"
            value={form.address}
            onChange={set("address")}
          />

          <div className="divider" />
          <p className="section-title">Optional overrides</p>

          <FormField
            label="RPC URL"
            hint="Overrides SEPOLIA_RPC_URL env var on the server"
            placeholder="https://rpc.ankr.com/eth_sepolia"
            value={form.rpcUrl}
            onChange={set("rpcUrl")}
          />
          <FormField
            label="Expected signer identity"
            hint="Overrides TRUSTED_SIGNER_IDENTITY env var"
            placeholder="github-actions@your-org.iam.gserviceaccount.com"
            value={form.expectedSigner}
            onChange={set("expectedSigner")}
          />

          <button
            className="btn-primary w-full mt-2"
            onClick={run}
            disabled={busy || !form.artifactPath || !form.bundlePath || !form.version || !form.address}
          >
            {busy ? "RUNNING CHECKS…" : "RUN CRYPTOGRAPHIC CHECKS"}
          </button>

          {apiError && (
            <p className="text-sm text-[var(--accent-red)] bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 rounded-lg px-3 py-2">
              {apiError}
            </p>
          )}
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          {/* Check summary */}
          <div className="card">
            <p className="section-title">Check results</p>
            <div className="space-y-2">
              <CheckRow
                label="Artifact hash"
                state={result == null ? "unknown" : result.artifact ? "pass" : "fail"}
                detail={result?.artifact ? "Computed" : undefined}
              />
              <CheckRow
                label="Audit approval"
                state={result == null ? "unknown" : checkState(auditPassed)}
              />
              <CheckRow
                label="Sigstore / Cosign"
                state={result == null ? "unknown" : checkState(sigPassed)}
                detail={result?.signature?.signer?.slice(0, 24) ?? undefined}
              />
              <CheckRow
                label="Contract address"
                state={result == null ? "unknown" : checkState(addressPassed)}
              />
              <CheckRow
                label="Bytecode match"
                state={result == null ? "unknown" : checkState(bytecodePassed)}
              />
            </div>
          </div>

          {/* Status */}
          {(loading || result) && (
            <StatusCard
              verified={loading ? null : result?.verified ?? false}
              reasons={result?.reasons}
            />
          )}

          {/* Hashes */}
          {result?.artifact && (
            <div className="card space-y-3">
              <p className="section-title">Hash comparison</p>
              <HashDisplay
                label="Artifact SHA-256"
                value={result.artifact.artifactHash}
              />
              <HashDisplay
                label="Expected runtime bytecode hash"
                value={result.artifact.runtimeBytecodeHash}
                highlight={bytecodePassed ? "match" : result.actualRuntimeBytecodeHash ? "mismatch" : "neutral"}
              />
              <HashDisplay
                label="Actual on-chain bytecode hash"
                value={result.actualRuntimeBytecodeHash ?? ""}
                highlight={bytecodePassed ? "match" : result.actualRuntimeBytecodeHash ? "mismatch" : "neutral"}
              />
            </div>
          )}

          {/* Signer info */}
          {result?.signature?.signer && (
            <div className="card">
              <p className="section-title">Signer identity</p>
              <p className="hash-text">{result.signature.signer}</p>
              {result.signature.issuer && (
                <>
                  <p className="section-title mt-3">OIDC Issuer</p>
                  <p className="hash-text">{result.signature.issuer}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
