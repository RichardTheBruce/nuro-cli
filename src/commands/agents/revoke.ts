/**
 * `nuro agents revoke <id>` -- revoke an agent connector.
 *
 * Hits DELETE /api/connectors/agent/:id, which sets the agent's status
 * to 'revoked' on the backend (the API key stops working immediately).
 * Confirms with the user first since revocation is one-way: a revoked
 * agent can be re-registered as a new one but the old key never works
 * again.
 *
 * --yes / -y skips the confirmation prompt -- needed for scripting and
 * CI jobs that revoke programmatically.
 */

import pc from "picocolors";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { getToken } from "../../lib/credentials.js";
import { apiRequest, ApiError } from "../../lib/api.js";

async function confirm(prompt: string): Promise<boolean> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const answer = (await rl.question(prompt)).trim().toLowerCase();
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

export async function agentsRevokeCommand(
  id: string | undefined,
  opts: { yes?: boolean },
): Promise<void> {
  const token = await getToken();
  if (!token) {
    console.error(pc.red("✗"), "Not signed in. Run `nuro auth set <token>` first.");
    process.exit(1);
  }

  if (!id?.trim()) {
    console.error(pc.red("✗"), "Agent id required.");
    console.error();
    console.error("Usage:");
    console.error(`  ${pc.cyan("nuro agents revoke <id>")}`);
    console.error();
    console.error(`Find an id with ${pc.cyan("nuro agents list")}.`);
    process.exit(1);
  }

  if (!opts.yes) {
    const ok = await confirm(
      `Revoke agent ${pc.bold(id)}? Its API key stops working immediately. (y/N) `,
    );
    if (!ok) {
      console.log(pc.dim("Cancelled."));
      return;
    }
  }

  try {
    await apiRequest(`/api/connectors/agent/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token,
    });
    console.log(pc.green("✓"), `Agent ${id} revoked.`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      console.error(pc.red("✗"), "Token rejected. Run `nuro auth set <token>` with a fresh token.");
      process.exit(1);
    }
    if (err instanceof ApiError && err.status === 404) {
      console.error(pc.red("✗"), `No agent with id "${id}". Run \`nuro agents list\` to see your agents.`);
      process.exit(1);
    }
    if (err instanceof ApiError) {
      console.error(pc.red("✗"), `Failed to revoke: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}
