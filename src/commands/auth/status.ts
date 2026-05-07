/**
 * `nuro auth status` -- show the active token's owner.
 *
 * Reads the token from env or ~/.nuro/credentials, calls
 * GET /api/users/me on the backend, and renders a tight summary.
 *
 * Failure modes:
 *   - No token configured -> friendly "run nuro auth set" message, exit 1
 *   - Token configured but rejected by backend -> "token invalid" + exit 1
 *   - Network error -> surface the error, exit 1
 */

import pc from "picocolors";
import { getToken } from "../../lib/credentials.js";
import { apiRequest, ApiError } from "../../lib/api.js";

interface MeResponse {
  id?: string;
  email?: string;
  username?: string;
  // Backend may surface a few other fields; we only render the ones
  // we recognize. Everything else is ignored to keep output tidy.
}

export async function authStatusCommand(): Promise<void> {
  const token = await getToken();
  if (!token) {
    console.log(pc.yellow("!"), "Not signed in.");
    console.log();
    console.log("To sign in:");
    console.log(`  1. Get a token at ${pc.cyan("https://app.nuro.finance/dashboard/connectors")}`);
    console.log(`  2. ${pc.cyan("nuro auth set <token>")}`);
    process.exit(1);
  }

  try {
    const me = await apiRequest<MeResponse>("/api/users/me", { token });
    console.log(pc.green("✓"), "Signed in.");
    if (me.email) console.log(pc.dim("  email:    "), me.email);
    if (me.username) console.log(pc.dim("  username: "), me.username);
    if (me.id) console.log(pc.dim("  id:       "), me.id);
    console.log(pc.dim(`  source:   ${process.env.NURO_KEY ? "$NURO_KEY env" : "credentials file"}`));
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      console.error(pc.red("✗"), "Token rejected (HTTP 401).");
      console.error(`  Run ${pc.cyan("nuro auth set <token>")} with a fresh token.`);
      process.exit(1);
    }
    if (err instanceof ApiError && err.status === 0) {
      console.error(pc.red("✗"), err.message);
      process.exit(1);
    }
    throw err;
  }
}
