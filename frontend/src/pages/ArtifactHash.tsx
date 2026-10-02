import { useState } from "react";
import { FileCode2, Info, AlertTriangle, Copy, Check } from "lucide-react";
import { artifactsApi, type ArtifactInfo, ApiError } from "../api";
import FormField from "../components/FormField";
import HashDisplay from "../components/HashDisplay";

export default function ArtifactHash() {
  const [path, setPath] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ArtifactInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const run = async () => {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const r = await artifactsApi.hash(path);
      setResult(r);
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

  const copyAll = async () => {
    if (!result) return;
    const text = [
      `Artifact:        ${result.artifactHash}`,
      `Creation BC:     ${result.creationBytecodeHash}`,
      `Runtime BC:      ${result.runtimeBytecodeHash}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <FileCode2 size={22} className="text-[var(--text-secondary)]" />
          Artifact Hash
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Compute SHA-256 hashes of a compiled Hardhat or Foundry JSON artifact.
        </p>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 text-sm text-[var(--text-secondary)]">
        <Info size={15} className="text-[var(--accent-blue)] mt-0.5 shrink-0" />
        <p>
          The path is resolved on the <strong>server filesystem</strong>. The artifact must be a
          JSON file with <code className="font-mono text-xs px-1 py-0.5 bg-white/10 rounded">bytecode.object</code> and{" "}
          <code className="font-mono text-xs px-1 py-0.5 bg-white/10 rounded">deployedBytecode.object</code> fields.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="card space-y-4">
          <p className="section-title">Artifact path</p>

          <FormField
            label="Server path to artifact JSON"
            hint="Absolute path on the machine running the backend"
            placeholder="/app/artifacts/contracts/MyContract.sol/MyContract.json"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />

          <button
            className="btn-primary w-full"
            onClick={run}
            disabled={busy || !path.trim()}
          >
            {busy ? "COMPUTING…" : "COMPUTE HASHES"}
          </button>

          {error && (
            <div className="flex items-start gap-2 text-sm text-[var(--accent-red)] bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 rounded-lg px-3 py-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        <div className="space-y-4">
          {result ? (
            <div className="card space-y-4 slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-title mb-0">Computed hashes</p>
                  {result.contractName && (
                    <p className="text-sm text-[var(--text-primary)] mt-0.5 font-medium">
                      {result.contractName}
                    </p>
                  )}
                </div>
                <button
                  onClick={copyAll}
                  className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
                >
                  {copiedAll ? (
                    <>
                      <Check size={12} className="text-[var(--accent-green)]" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy all
                    </>
                  )}
                </button>
              </div>

              <HashDisplay label="Artifact SHA-256" value={result.artifactHash} />
              <HashDisplay label="Creation bytecode SHA-256" value={result.creationBytecodeHash} />
              <HashDisplay label="Runtime bytecode SHA-256" value={result.runtimeBytecodeHash} />

              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20">
                <Info size={13} className="text-[var(--accent-green)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--text-secondary)]">
                  Use the <strong>Artifact SHA-256</strong> when submitting an audit approval.
                  The <strong>Runtime bytecode SHA-256</strong> is compared against{" "}
                  <code className="font-mono text-[10px] px-1 bg-white/10 rounded">eth_getCode</code>{" "}
                  during deployment verification.
                </p>
              </div>
            </div>
          ) : (
            <div className="card self-start">
              <p className="section-title">What these hashes represent</p>
              <div className="space-y-4">
                {[
                  {
                    label: "Artifact SHA-256",
                    desc: "SHA-256 of the entire raw artifact JSON file. Used as the artifact identity key in audit approvals.",
                    color: "text-[var(--accent-green)]",
                  },
                  {
                    label: "Creation bytecode SHA-256",
                    desc: "SHA-256 of the creation (constructor) bytecode hex from bytecode.object.",
                    color: "text-[var(--accent-blue)]",
                  },
                  {
                    label: "Runtime bytecode SHA-256",
                    desc: "SHA-256 of the deployed bytecode hex. This is compared against the actual on-chain code during verification.",
                    color: "text-[var(--accent-yellow)]",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span
                      className={`text-lg font-bold shrink-0 mt-0.5 ${item.color}`}
                    >
                      #
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${item.color}`}>{item.label}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
