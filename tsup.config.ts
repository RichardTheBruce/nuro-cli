import { defineConfig } from "tsup";

/**
 * tsup config — bundles the CLI to a single ESM file at dist/cli.js.
 *
 * Why these flags:
 *  - format: "esm" — Node 18+ supports ESM natively, no CJS round-trip
 *  - target: "node18" — matches our engines.node minimum
 *  - banner: shebang so `nuro` is executable after npm install -g
 *  - clean: nuke dist/ before each build to avoid stale artifacts
 *  - minify: false — readable stack traces matter more than 5KB savings
 */
export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  minify: false,
  sourcemap: false,
  splitting: false,
  banner: { js: "#!/usr/bin/env node" },
});
