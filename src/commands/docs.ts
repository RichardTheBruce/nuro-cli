/**
 * `nuro docs`. Opens the Skills catalog page in the user's default browser.
 *
 * Why /skills as the docs entry point: it's the marketing-grade page that
 * lays out every Nuro capability (the neo-bank pillars, the pantheon,
 * the journey, the API surface). It also links out to per-skill detail
 * pages (heimdall-threat-intel, huginn-counsel, etc.) for deeper dives.
 */

import pc from "picocolors";
import open from "open";

const DOCS_URL = "https://app.nuro.finance/skills";

export async function docsCommand(): Promise<void> {
  console.log(`${pc.cyan("→")} Opening ${pc.cyan(DOCS_URL)} ...`);
  try {
    await open(DOCS_URL);
  } catch (err) {
    console.error(
      pc.red("✗"),
      `Couldn't open browser. Visit ${pc.cyan(DOCS_URL)} manually.`,
    );
    if (process.env.DEBUG) {
      console.error(err);
    }
  }
}
