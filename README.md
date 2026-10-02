# Verifiable Smart Contract Deployer

This is a Sepolia security gate for deployment records. It hashes a compiled artifact, requires an audit approval for that exact artifact/version pair, verifies a real keyless Sigstore bundle with Cosign, and compares the expected runtime-bytecode SHA-256 digest with `eth_getCode`.

```
artifact -> SHA-256 -> audit approval -> Cosign/Fulcio/Rekor -> eth_getCode -> trusted registry record
```

## Run

Copy `.env.example` to `.env`, set `SEPOLIA_RPC_URL`, `TRUSTED_SIGNER_IDENTITY`, and `TRUSTED_OIDC_ISSUER`, then run `pnpm install`, `pnpm build`, `pnpm dev:backend`, and `pnpm dev:frontend`.

Create a keyless bundle in GitHub Actions with `cosign sign-blob --yes --bundle artifact.bundle artifact.json`. Submit the artifact path, bundle path, version, and deployed Sepolia address to `POST /api/deploy/verify`; only a passing result can be registered at `POST /api/deployments`.

## Security notes

The API fails closed if Cosign is absent, the bundle is missing, policy is not configured, audit is missing, RPC fails, no code exists, or bytecode differs. Do not expose deployer keys to the browser. In-memory records are intentionally demo-only; connect the provided Solidity registries and durable database before production.
