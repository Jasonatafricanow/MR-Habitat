import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Box3 } from "three";
import { loadExternalShell } from "./shellLoader";
import type { FixedShellSource } from "../assets/shell";
import { disposeModel } from "../imported/glb";
import { createElement, isValidElement } from "react";
import { FixedShell } from "./FixedShell";
import { paperwood } from "../assets/demo";
import { createXiyuePackage } from "../assets/xiyue";
import { proceduralShell } from "../assets/shell";

const source: FixedShellSource = {
  schemaVersion: 1,
  kind: "glb",
  uri: "/fixtures/crate.glb",
};
it("loads a JSON shell locator into visual geometry without prop normalization", async () => {
  const bytes = readFileSync("public/fixtures/crate.glb");
  const fetcher = vi.fn(async () => new Response(bytes));
  const shell = await loadExternalShell(
    JSON.parse(JSON.stringify(source)),
    undefined,
    fetcher,
  );
  expect(fetcher).toHaveBeenCalledWith(
    source.uri,
    expect.objectContaining({ signal: undefined }),
  );
  expect(new Box3().setFromObject(shell).min.y).toBeGreaterThan(0);
  expect(shell.children.length).toBeGreaterThan(0);
  expect(source).toEqual({
    schemaVersion: 1,
    kind: "glb",
    uri: "/fixtures/crate.glb",
  });
  disposeModel(shell);
});
it("reports missing and invalid shell files and propagates cancellation", async () => {
  await expect(
    loadExternalShell(
      source,
      undefined,
      async () => new Response(null, { status: 404 }),
    ),
  ).rejects.toThrow(/404/);
  await expect(
    loadExternalShell(
      source,
      undefined,
      async () => new Response(new Uint8Array(24)),
    ),
  ).rejects.toThrow();
  const controller = new AbortController();
  controller.abort();
  await expect(loadExternalShell(source, controller.signal)).rejects.toThrow();
});

it("keeps both shipped worlds procedural and swaps only the shell visual branch", () => {
  const home = createXiyuePackage();
  expect(home.fixedShell).toEqual(proceduralShell);
  expect(paperwood.fixedShell).toEqual(proceduralShell);
  const future = { ...home, fixedShell: source };
  expect(future.definition).toBe(home.definition);
  expect(future.Surface).toBe(home.Surface);
  const geometry = createElement("group", {
    name: "existing-procedural-geometry",
  });
  expect(FixedShell({ source: home.fixedShell, children: geometry })).toBe(
    geometry,
  );
  const external = FixedShell({ source, children: geometry });
  expect(isValidElement(external)).toBe(true);
  expect(external).not.toBe(geometry);
  expect((external as { props: { source: unknown } }).props.source).toBe(
    source,
  );
});
