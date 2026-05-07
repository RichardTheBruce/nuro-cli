/**
 * Nuro CLI -- entry point.
 *
 * Single TypeScript source bundled by tsup into dist/cli.js with a
 * shebang banner. Installed globally via `npm install -g @nuro-finance/cli`,
 * which symlinks `nuro` onto the user's PATH.
 *
 * Design principles (held from v0.1.0 forward):
 *  - Subcommands feel like `gh`, `vercel`, `stripe`. Verbs first.
 *  - Every long-running step gets a status line. No silent waits.
 *  - Every output is greppable: machine-friendly with --json on every list.
 *  - No hidden network calls during `--help` / `--version`. Cold-start
 *    intro should be instant.
 *  - Honest about what's stubbed: a "(coming in v0.X)" prefix is fine,
 *    a "registered agent successfully!" lie is not.
 *
 * v0.2.0 changes (this release):
 *  - Real `nuro auth set/status/logout` -- credentials in ~/.nuro/credentials
 *  - Real `nuro register-agent` -- POSTs to /api/connectors/agent
 *  - Real `nuro agents list` and `nuro agents revoke <id>`
 *  - NURO_KEY env var as auth fallback (CI-friendly)
 */

import { Command } from "commander";
import pc from "picocolors";

import { initCommand } from "./commands/init.js";
import { docsCommand } from "./commands/docs.js";
import { dashboardCommand } from "./commands/dashboard.js";
import { authSetCommand } from "./commands/auth/set.js";
import { authStatusCommand } from "./commands/auth/status.js";
import { authLogoutCommand } from "./commands/auth/logout.js";
import { registerAgentCommand } from "./commands/agents/register.js";
import { agentsListCommand } from "./commands/agents/list.js";
import { agentsRevokeCommand } from "./commands/agents/revoke.js";

import pkg from "../package.json" with { type: "json" };

const program = new Command();

program
  .name("nuro")
  .description(
    `${pc.bold("Nuro CLI")}. Agentic finance, orchestrated from your terminal.\n\n` +
      `  One control plane for every agent, card, and chain.\n` +
      `  Bridge USDC across 23 chains. Issue Visa cards with on-chain budget enforcement.\n` +
      `  Connect bank accounts. Watched by Mythos.`,
  )
  .version(pkg.version, "-v, --version", "print the CLI version")
  .helpOption("-h, --help", "show command help");

// ────────────────────────────────────────────────────────────────────
// Top-level convenience commands
// ────────────────────────────────────────────────────────────────────

program
  .command("init")
  .description("welcome message + sign-up link + next steps")
  .action(initCommand);

program
  .command("docs")
  .description("open the Nuro docs (Skills catalog) in your browser")
  .action(docsCommand);

program
  .command("dashboard")
  .description("open your Nuro dashboard in your browser")
  .action(dashboardCommand);

// ────────────────────────────────────────────────────────────────────
// auth -- credential management
// ────────────────────────────────────────────────────────────────────

const auth = program.command("auth").description("manage your local CLI credentials");

auth
  .command("set <token>")
  .description("save a CLI access token to ~/.nuro/credentials")
  .action(authSetCommand);

auth
  .command("status")
  .description("show the active token's owner")
  .action(authStatusCommand);

auth
  .command("logout")
  .description("delete the local credentials file")
  .action(authLogoutCommand);

// ────────────────────────────────────────────────────────────────────
// register-agent -- shortcut for `nuro agents register`
// (kept top-level because that's the primary v0.2.0 demo command;
//  matches the `--name` flag pattern shown on /agents and /skills)
// ────────────────────────────────────────────────────────────────────

program
  .command("register-agent")
  .description("register a new external agent connector")
  .option("--name <name>", "agent display name (required)")
  .option("--runtime <runtime>", "claude | openai | langchain | custom", "claude")
  .option("--markets <markets>", "comma-separated markets (e.g. polymarket,hyperliquid)")
  .option("--chain <chain>", "settlement chain hint (base | arbitrum | polygon | solana)")
  .option("--risk-limit-usd <usd>", "per-action cap in USD")
  .option("--daily-cap-usd <usd>", "per-day cap in USD")
  .option("--webhook-url <url>", "optional webhook URL for policy decisions")
  .action(registerAgentCommand);

// ────────────────────────────────────────────────────────────────────
// agents -- list / revoke / (more in v0.3.0)
// ────────────────────────────────────────────────────────────────────

const agents = program.command("agents").description("manage registered agent connectors");

agents
  .command("list")
  .description("list your registered agents")
  .option("--json", "emit raw JSON for scripting")
  .action(agentsListCommand);

agents
  .command("revoke <id>")
  .description("revoke an agent connector (one-way; API key stops working immediately)")
  .option("-y, --yes", "skip confirmation prompt")
  .action(agentsRevokeCommand);

// ────────────────────────────────────────────────────────────────────
// wallet -- stub, ships v0.3.0
// ────────────────────────────────────────────────────────────────────

program
  .command("wallet")
  .description("wallet status, balances, transactions (coming in v0.3.0)")
  .action(() => {
    console.log(pc.dim("`nuro wallet` ships in v0.3.0. For now, view your wallet at:"));
    console.log(`  ${pc.cyan("https://app.nuro.finance/dashboard/my-wallet")}`);
  });

// Footer help text. Prints when no subcommand is given.
program.addHelpText(
  "after",
  `\nLearn more:\n` +
    `  Skills catalog:  ${pc.cyan("https://app.nuro.finance/skills")}\n` +
    `  Agents page:     ${pc.cyan("https://app.nuro.finance/agents")}\n` +
    `  Smart contracts: ${pc.cyan("https://app.nuro.finance/contracts")}\n\n` +
    `Auth:\n` +
    `  Get a CLI token at ${pc.cyan("https://app.nuro.finance/dashboard/connectors")}\n` +
    `  Then run: ${pc.cyan("nuro auth set <token>")}\n` +
    `  Or set ${pc.cyan("NURO_KEY")} env var for CI use.\n`,
);

program.parseAsync(process.argv).catch((err) => {
  console.error(pc.red("✗"), err instanceof Error ? err.message : String(err));
  process.exit(1);
});
