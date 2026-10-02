/**
 * Demo seed controller — injects a realistic pre-verified deployment record
 * into the in-memory store without requiring real artifact files, cosign, or
 * a live Sepolia RPC.  For development / demo use only.
 */
import { Router } from "express";
import { addAudit, addDeployment } from "../db/index.js";

const router = Router();

router.post("/seed", (_req, res) => {
  const DEMO = {
    contractAddress: "0xdEaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
    chainId: 11155111,
    artifactHash:
      "0xa3f1c2e4b5d6789012345678abcdef01a3f1c2e4b5d6789012345678abcdef01",
    runtimeBytecodeHash:
      "0x7b9e0f3a1c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
    creationBytecodeHash:
      "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    version: "1.0.0",
    auditor: "alice@audits.example.com",
    signerIdentity:
      "https://github.com/verifiable-deployer/.github/workflows/release.yml@refs/heads/main",
    rekorEntry:
      "https://rekor.sigstore.dev/api/v1/log/entries/24296fb24b8ad77a84afeeb3f48dd6ab7f6c2ace73d7f0ea680a34f7ad8e3cef44e72af5",
    oidcIssuer: "https://token.actions.githubusercontent.com",
  };

  try {
    // 1 — audit approval
    addAudit({
      auditor: DEMO.auditor,
      artifactHash: DEMO.artifactHash,
      version: DEMO.version,
      timestamp: Date.now() - 3600_000, // 1 hour ago
    });
  } catch {
    // already seeded — ignore duplicate
  }

  try {
    // 2 — trusted deployment record
    addDeployment({
      contractAddress: DEMO.contractAddress,
      chainId: DEMO.chainId,
      artifactHash: DEMO.artifactHash,
      runtimeBytecodeHash: DEMO.runtimeBytecodeHash,
      version: DEMO.version,
      signerIdentity: DEMO.signerIdentity,
      rekorEntry: DEMO.rekorEntry,
      auditApproved: true,
      sigstoreVerified: true,
      bytecodeVerified: true,
      status: "TRUSTED",
      reasons: [],
      timestamp: Date.now() - 1800_000, // 30 min ago
    });
  } catch {
    // already seeded — ignore duplicate
  }

  res.status(201).json({
    message: "Demo deployment seeded successfully",
    demo: DEMO,
  });
});

export default router;
