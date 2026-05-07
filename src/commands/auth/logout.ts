/**
 * `nuro auth logout` -- delete the local credentials file.
 *
 * Only affects ~/.nuro/credentials. NURO_KEY env var (if set) is left
 * alone -- callers who want a clean slate also need to `unset NURO_KEY`
 * in their shell. The status output of `nuro auth status` after logout
 * makes the env-var fallback obvious.
 */

import pc from "picocolors";
import { clearToken } from "../../lib/credentials.js";

export async function authLogoutCommand(): Promise<void> {
  await clearToken();
  console.log(pc.green("✓"), "Local credentials cleared.");
  if (process.env.NURO_KEY) {
    console.log(
      pc.yellow("!"),
      `NURO_KEY env var is still set. ${pc.dim("Unset it in your shell to fully sign out.")}`,
    );
  }
}
