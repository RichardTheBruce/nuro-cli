/**
 * `nuro register-agent` -- register a new external agent connector.
 *
 * Real implementation as of v0.2.0. POSTs to /api/connectors/agent with
 * the same payload shape the dashboard's CreateAgentModal uses, so the
 * backend treats CLI-registered and UI-registered agents identically
 * (single source of truth for validation, rate limits, dedupe).
 *
 * Required: --name. Other fields have sensible defaults so a quick
 * smoke-test is one line:
 *   nuro register-agent --name DemoBot
 *
 * Output on success: agent ID, API key, webhook secret -- all only
 * printed once. The user is responsible for saving them. We mirror the
 * dashboard's "this is the only time you'll see these" warning.
 */

import pc from "picocolors";
import { getToken } from "../../lib/credentials.js";
import { apiRequest, ApiError } from "../../lib/api.js";

interface RegisterAgentOptions {
  name?: string;
  runtime?: string;
  markets?: string;
  chain?: string;
  riskLimitUsd?: string;
  dailyCapUsd?: string;
  webhookUrl?: string;
}

interface CreateAgentResponse {
  agent: {
    id: string;
    name: string;
    agentType: string;
    apiKeyPrefix: string;
    status: string;
  };
  apiKey: string;
  webhookSecret: string;
}

const VALID_RUNTIMES = ["claude", "openai", "langchain", "custom"] as const;

export async function registerAgentCommand(opts: RegisterAgentOptions): Promise<void> {
  const token = await getToken();
  if (!token) {
    console.error(pc.red("✗"), "Not signed in.");
    console.error(`  Run ${pc.cyan("nuro auth set <token>")} first.`);
    console.error(`  Get a token at ${pc.cyan("https://app.nuro.finance/dashboard/connectors")}.`);
    process.exit(1);
  }

  if (!opts.name?.trim()) {
    console.error(pc.red("✗"), "--name is required.");
    console.error();
    console.error("Example:");
    console.error(
      `  ${pc.cyan(
        "nuro register-agent --name DemoBot --runtime claude --markets polymarket --chain base",
      )}`,
    );
    process.exit(1);
  }

  const runtime = (opts.runtime ?? "claude").toLowerCase();
  if (!VALID_RUNTIMES.includes(runtime as (typeof VALID_RUNTIMES)[number])) {
    console.error(
      pc.red("✗"),
      `Invalid --runtime "${runtime}". Choose one of: ${VALID_RUNTIMES.join(", ")}.`,
    );
    process.exit(1);
  }

  // Markets and capabilities default to a sensible Polymarket+Mythos
  // baseline so the smoke-test path doesn't need every flag.
  const markets = opts.markets
    ? opts.markets
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)
    : ["polymarket"];

  const body = {
    name: opts.name.trim(),
    agentType: runtime,
    capabilities: ["mythos"],
    riskLimitUsd: opts.riskLimitUsd ? Number(opts.riskLimitUsd) : 50,
    dailyCapUsd: opts.dailyCapUsd ? Number(opts.dailyCapUsd) : 500,
    allowedMarkets: markets,
    webhookUrl: opts.webhookUrl?.trim() || undefined,
  };

  console.log(pc.dim("Registering agent..."));

  try {
    const data = await apiRequest<CreateAgentResponse>("/api/connectors/agent", {
      method: "POST",
      token,
      body,
    });

    console.log();
    console.log(pc.green("✓"), `Agent ${pc.bold(data.agent.name)} registered.`);
    console.log();
    console.log(pc.dim(" id:        "), data.agent.id);
    console.log(pc.dim(" type:      "), data.agent.agentType);
    console.log(pc.dim(" status:    "), data.agent.status);
    console.log();
    console.log(
      pc.yellow("!"),
      pc.bold("These secrets are shown ONCE. Save them now."),
    );
    console.log();
    console.log(pc.dim(" API key:        "), pc.cyan(data.apiKey));
    console.log(pc.dim(" Webhook secret: "), pc.cyan(data.webhookSecret));
    console.log();
    console.log("Test it:");
    console.log(
      `  ${pc.cyan(
        `curl https://api.nuro.finance/event -H "Authorization: Bearer ${data.apiKey}" -d '{"subject":"hello"}'`,
      )}`,
    );
    if (opts.chain) {
      console.log(pc.dim(`(--chain "${opts.chain}" was passed but settlement chain config lands in v0.3.0.)`));
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      console.error(pc.red("✗"), "Token rejected. Run `nuro auth set <token>` with a fresh token.");
      process.exit(1);
    }
    if (err instanceof ApiError) {
      console.error(pc.red("✗"), `Failed to register: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}
