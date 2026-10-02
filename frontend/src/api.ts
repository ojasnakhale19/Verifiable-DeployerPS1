// ── API client ──────────────────────────────────────────────────────────────
// All paths are proxied by Vite: /api → http://localhost:3000/api

export interface ArtifactInfo {
  artifactPath: string;
  artifactHash: string;
  creationBytecodeHash: string;
  runtimeBytecodeHash: string;
  contractName?: string;
}

export interface AuditApproval {
  auditor: string;
  artifactHash: string;
  version: string;
  timestamp: number;
}

export interface VerificationResult {
  verified: boolean;
  reasons: string[];
  signer?: string;
  issuer?: string;
}

export interface Deployment {
  contractAddress: string;
  chainId: number;
  artifactHash: string;
  runtimeBytecodeHash: string;
  version: string;
  signerIdentity: string;
  rekorEntry?: string;
  auditApproved: boolean;
  sigstoreVerified: boolean;
  bytecodeVerified: boolean;
  status: "TRUSTED" | "REJECTED";
  reasons: string[];
  timestamp: number;
}

export interface DeployVerifyResult {
  verified: boolean;
  reasons: string[];
  artifact?: ArtifactInfo;
  signature?: VerificationResult;
  actualRuntimeBytecodeHash?: string;
  chainId?: number;
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    const reasons = Array.isArray(data?.reasons)
      ? data.reasons.filter((reason: unknown): reason is string => typeof reason === "string").join(" · ")
      : undefined;
    throw new ApiError(res.status, data?.error ?? reasons ?? `Request failed (HTTP ${res.status})`, data);
  }
  return data as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── artifacts ────────────────────────────────────────────────────────────────

export const artifactsApi = {
  hash: (artifactPath: string) =>
    request<ArtifactInfo>("/api/artifacts/hash", {
      method: "POST",
      body: JSON.stringify({ artifactPath }),
    }),
};

// ── audit ────────────────────────────────────────────────────────────────────

export const auditApi = {
  approve: (payload: { auditor: string; artifactHash: string; version: string }) =>
    request<{ approval: AuditApproval }>("/api/audit/approve", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── sigstore ─────────────────────────────────────────────────────────────────

export const sigstoreApi = {
  verify: (payload: { artifactPath: string; bundlePath: string; expectedSigner?: string }) =>
    request<VerificationResult>("/api/sigstore/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  rekorEntry: (id: string) =>
    request<unknown>(`/api/sigstore/rekor/${id}`),
};

// ── deployments ──────────────────────────────────────────────────────────────

export const deploymentsApi = {
  verify: (payload: {
    artifactPath: string;
    bundlePath: string;
    version: string;
    address: string;
    rpcUrl?: string;
    expectedSigner?: string;
  }) =>
    request<DeployVerifyResult>("/api/deploy/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: {
    artifactPath: string;
    bundlePath: string;
    version: string;
    address: string;
    rpcUrl?: string;
    expectedSigner?: string;
  }) =>
    request<Deployment>("/api/deployments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: () => request<Deployment[]>("/api/deployments"),

  get: (address: string) => request<Deployment>(`/api/deployments/${address}`),
};
