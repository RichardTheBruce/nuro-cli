/**
 * `nuro dashboard` — opens the user's dashboard in their default browser.
 *
 * Once auth lands in v0.2.0, this will deep-link directly into the
 * authenticated dashboard. Today it just opens the entry URL — if the
 * user isn't signed in, the app's own auth gate redirects them through
 * /login.
 */

import pc from "picocolors";
import open from "open";

const DASHBOARD_URL = "https://app.nuro.finance/dashboard";

export async function dashboardCommand(): Promise<void> {
  console.log(`${pc.cyan("→")} Opening ${pc.cyan(DASHBOARD_URL)} ...`);
  try {
    await open(DASHBOARD_URL);
  } catch (err) {
    console.error(
      pc.red("✗"),
      `Couldn't open browser. Visit ${pc.cyan(DASHBOARD_URL)} manually.`,
    );
    if (process.env.DEBUG) {
      console.error(err);
    }
  }
}
