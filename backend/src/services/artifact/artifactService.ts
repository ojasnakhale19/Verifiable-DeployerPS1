import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
export interface ArtifactInfo { artifactPath: string; artifactHash: string; creationBytecodeHash: string; runtimeBytecodeHash: string; contractName?: string; }
export const sha256Hex = (value: Uint8Array | string, encoding?: BufferEncoding) => { const hash=createHash("sha256"); return `0x${typeof value === "string" ? hash.update(value,encoding ?? "utf8").digest("hex") : hash.update(value).digest("hex")}`; };
const bytecode = (value: unknown) => { const v = typeof value === "string" ? value : ""; if (!/^(0x)?[0-9a-fA-F]+$/.test(v)) throw new Error("Artifact contains invalid bytecode"); return v.replace(/^0x/, ""); };
export function inspectArtifact(inputPath: string): ArtifactInfo {
 const artifactPath=resolve(inputPath); if(!existsSync(artifactPath)) throw new Error("Artifact does not exist"); const raw=readFileSync(artifactPath); let json: Record<string, unknown>; try { json=JSON.parse(raw.toString()); } catch { throw new Error("Artifact is not valid JSON"); }
 const creation=bytecode((json.bytecode as Record<string,unknown>)?.object ?? json.bytecode); const runtime=bytecode((json.deployedBytecode as Record<string,unknown>)?.object ?? json.deployedBytecode);
 return { artifactPath, artifactHash:sha256Hex(raw), creationBytecodeHash:sha256Hex(creation,"hex"), runtimeBytecodeHash:sha256Hex(runtime,"hex"), contractName:typeof json.contractName === "string" ? json.contractName : undefined };
}
