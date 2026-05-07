/**
 * Nuro CLI entry point.
 *
 * Single TypeScript source bundled by tsup into dist/cli.js with a
 * shebang banner. Installed globally via `npm install -g @nuro-finance/cli`,
 * which symlinks `nuro` onto the user's PATH.
 *
 * Design principles (will hold from v0.1.0 forward):
 *  - Subcommands feel like `gh`, `vercel`, `stripe`. Verbs first: `nuro init`,
 *    `nuro docs`, `nuro register-agent`, `nuro agents list`.
 *  - Every long-running step gets a status line. No silent waits.
 *  - Every output is greppable: machine-friendly with --json on every list.
 *  - No hidden network calls during `--help` / `--version`. Cold-start
 *    intro should be instant.
 *  - Honest about what's stubbed: a "(coming in v0.X)" prefix is fine,
 *    a "registered agent successfully!" lie is not.
 */

import { Command } from "commander";
import pc from "picocolors";

import { initCommand } from "./commands/init.js";
import { docsCommand } from "./commands/docs.js";
import { dashboardCommand } from "./commands/dashboard.js";
import { registerAgentCommand } from "./commands/register-agent.js";

// Read version + description straight from package.json so we never drift.
// Bundled by tsup as a JSON import.
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

// ─────────────────────────────────────────────────────────────────────────────
// Top-level commands
// ─────────────────────────────────────────────────────────────────────────────

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

program
  .command("register-agent")
  .description("register a new agent connector (interactive)")
  .option("--name <name>", "agent display name")
  .option("--runtime <runtime>", "agent runtime: claude | openai | custom")
  .option("--markets <markets>", "comma-separated markets: polymarket,hyperliquid,...")
  .option("--chain <chain>", "settlement chain: base | arbitrum | polygon | solana | ...")
  .action(registerAgentCommand);

// Aliases for convenience
program
  .command("agents")
  .description("agent management (list, revoke, inspect) -- coming in v0.2.0")
  .action(() => {
    console.log(
      pc.dim("`nuro agents` is coming in v0.2.0. For now, manage agents at:"),
    );
    console.log(`  ${pc.cyan("https://app.nuro.finance/dashboard/connectors")}`);
  });

program
  .command("wallet")
  .description("wallet status, balances, transactions (coming in v0.2.0)")
  .action(() => {
    console.log(
      pc.dim("`nuro wallet` is coming in v0.2.0. For now, view your wallet at:"),
    );
    console.log(`  ${pc.cyan("https://app.nuro.finance/dashboard/my-wallet")}`);
  });

// Footer help text. Prints when no subcommand is given.
program.addHelpText(
  "after",
  `\nLearn more:\n` +
    `  Skills catalog:  ${pc.cyan("https://app.nuro.finance/skills")}\n` +
    `  Agents page:     ${pc.cyan("https://app.nuro.finance/agents")}\n` +
    `  Smart contracts: ${pc.cyan("https://app.nuro.finance/contracts")}\n`,
);

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

program.parseAsync(process.argv).catch((err) => {
  console.error(pc.red("✗"), err instanceof Error ? err.message : String(err));
  process.exit(1);
});
