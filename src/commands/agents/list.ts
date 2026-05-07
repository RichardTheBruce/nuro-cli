/**
 * `nuro agents list` -- show the user's registered agent connectors.
 *
 * GETs /api/connectors/agent. Renders a tight table: status dot, name,
 * runtime, prefix (first chars of the API key), event count, last
 * activity. Output stays under 80 chars per row so it reads cleanly in
 * a standard terminal without wrapping.
 *
 * --json flag emits the raw API response for piping into jq / scripts.
 * Same opt-in pattern that gh / aws / kubectl use.
 */

import pc from "picocolors";
import { getToken } from "../../lib/credentials.js";
import { apiRequest, ApiError } from "../../lib/api.js";

interface AgentSummary {
  id: string;
  name: string;
  agentType: string;
  apiKeyPrefix: string;
  status: "active" | "paused" | "revoked";
  totalEvents: number;
  lastEventAt: string | null;
}

interface ListResponse {
  agents: AgentSummary[];
}

const STATUS_DOT: Record<AgentSummary["status"], string> = {
  active: pc.green("●"),
  paused: pc.yellow("●"),
  revoked: pc.dim("●"),
};

function fmtAgo(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export async function agentsListCommand(opts: { json?: boolean }): Promise<void> {
  const token = await getToken();
  if (!token) {
    console.error(pc.red("✗"), "Not signed in. Run `nuro auth set <token>` first.");
    process.exit(1);
  }

  try {
    const data = await apiRequest<ListResponse>("/api/connectors/agent", { token });
    const agents = data.agents ?? [];

    if (opts.json) {
      console.log(JSON.stringify(agents, null, 2));
      return;
    }

    if (agents.length === 0) {
      console.log(pc.dim("No agents yet."));
      console.log();
      console.log("Register one:");
      console.log(`  ${pc.cyan("nuro register-agent --name MyBot")}`);
      return;
    }

    // Header
    console.log();
    console.log(
      "  " +
        pc.dim("STATUS  ") +
        pc.dim("NAME".padEnd(22)) +
        pc.dim("TYPE".padEnd(12)) +
        pc.dim("PREFIX".padEnd(14)) +
        pc.dim("EVENTS".padEnd(10)) +
        pc.dim("LAST"),
    );

    for (const a of agents) {
      const status = STATUS_DOT[a.status] ?? pc.dim("●");
      const name = a.name.length > 20 ? a.name.slice(0, 19) + "…" : a.name;
      const events = a.totalEvents.toLocaleString();
      console.log(
        `  ${status}      ` +
          name.padEnd(22) +
          a.agentType.padEnd(12) +
          (a.apiKeyPrefix + "…").padEnd(14) +
          events.padEnd(10) +
          fmtAgo(a.lastEventAt),
      );
    }
    console.log();
    console.log(pc.dim(`${agents.length} agent${agents.length === 1 ? "" : "s"}.`));
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      console.error(pc.red("✗"), "Token rejected. Run `nuro auth set <token>` with a fresh token.");
      process.exit(1);
    }
    if (err instanceof ApiError) {
      console.error(pc.red("✗"), `Failed to list agents: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}
