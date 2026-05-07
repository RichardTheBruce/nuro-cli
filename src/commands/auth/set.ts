/**
 * `nuro auth set <token>` -- store a CLI access token in ~/.nuro/credentials.
 *
 * Token sourcing for v0.2.0:
 *   - User signs into the dashboard at https://app.nuro.finance
 *   - Goes to /dashboard/connectors -> "Get CLI Token" card -> Reveal
 *   - Copies the token (starts with `nuro_cli_...`)
 *   - Pastes into `nuro auth set <token>` here
 *
 * v0.3.0 will add a device-code flow (`nuro auth login`) that does this
 * end-to-end without copy-paste, mirroring `gh auth login`. The
 * underlying credentials format stays the same so v0.3.0 is purely
 * additive -- old tokens keep working.
 */

import pc from "picocolors";
import { saveToken, credentialsPath } from "../../lib/credentials.js";

export async function authSetCommand(token: string | undefined): Promise<void> {
  if (!token || token.trim().length < 8) {
    console.error(pc.red("✗"), "Token argument required.");
    console.error();
    console.error("Usage:");
    console.error(`  ${pc.cyan("nuro auth set <token>")}`);
    console.error();
    console.error("Get a token from:");
    console.error(`  ${pc.cyan("https://app.nuro.finance/dashboard/connectors")}`);
    process.exit(1);
  }

  await saveToken(token);
  console.log(pc.green("✓"), "Token saved.");
  console.log(pc.dim(`  Stored in ${credentialsPath}`));
  console.log();
  console.log("Try it:");
  console.log(`  ${pc.cyan("nuro auth status")}`);
  console.log(`  ${pc.cyan("nuro agents list")}`);
}
