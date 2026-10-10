import type { FixedShellSource } from "../assets/shell";
import { inspectGlb, disposeModel, maxGlbBytes } from "../imported/glb";

/** R3F/Three adapter. No registry writes, origin correction or nav generation. */
export async function loadExternalShell(
  source: Extract<FixedShellSource, { kind: "glb" }>,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
) {
  signal?.throwIfAborted();
  if (source.schemaVersion !== 1 || !source.uri.trim())
    throw new Error("Invalid fixed shell source");
  const response = await fetcher(source.uri, { signal });
  if (!response.ok) throw new Error(`Fixed shell HTTP ${response.status}`);
  if (Number(response.headers.get("content-length")) > maxGlbBytes)
    throw new Error("Fixed shell exceeds 32 MB");
  const raw = await response.arrayBuffer();
  signal?.throwIfAborted();
  const { scene } = await inspectGlb(raw);
  if (signal?.aborted) {
    disposeModel(scene);
    signal.throwIfAborted();
  }
  return scene;
}
