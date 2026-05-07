/**
 * `nuro register-agent` — register a new agent connector.
 *
 * v0.1.0 scope: STUB. Prints the args the user provided + a clear
 * "this lands in v0.2.0" message + a link to the dashboard surface
 * that does the same thing today.
 *
 * Why ship a stub instead of nothing: the command appears in --help
 * starting v0.1.0, so users searching the CLI for "register" find it,
 * understand the shape (--name, --runtime, --markets, --chain), and
 * can preview the eventual UX. When v0.2.0 lands the same flags
 * become the actual interactive path.
 *
 * v0.2.0 plan:
 *   1. Read ~/.nuro/credentials (written by `nuro auth login`)
 *   2. Prompt interactively for any missing flags via @inquirer/prompts
 *   3. POST to https://api.nuro.finance/api/connectors/agent
 *   4. Print the new agent's connector_id + a curl preview of the
 *      proxied endpoint the agent's runtime should call.
 */

import pc from "picocolors";

interface RegisterAgentOptions {
  name?: string;
  runtime?: string;
  markets?: string;
  chain?: string;
}

export async function registerAgentCommand(opts: RegisterAgentOptions): Promise<void> {
  console.log(pc.dim("─".repeat(60)));
  console.log(pc.bold("  nuro register-agent ") + pc.dim("(coming in v0.2.0)"));
  console.log(pc.dim("─".repeat(60)));
  console.log();

  // Echo what the user typed so they know we parsed the flags.
  if (opts.name || opts.runtime || opts.markets || opts.chain) {
    console.log("  You provided:");
    if (opts.name) console.log(`    ${pc.dim("name    ")} ${pc.cyan(opts.name)}`);
    if (opts.runtime) console.log(`    ${pc.dim("runtime ")} ${pc.cyan(opts.runtime)}`);
    if (opts.markets) console.log(`    ${pc.dim("markets ")} ${pc.cyan(opts.markets)}`);
    if (opts.chain) console.log(`    ${pc.dim("chain   ")} ${pc.cyan(opts.chain)}`);
    console.log();
  } else {
    console.log("  Usage:");
    console.log(
      `    ${pc.cyan(
        "nuro register-agent --name my-agent --runtime claude --markets polymarket --chain base",
      )}`,
    );
    console.log();
  }

  console.log("  Today, register agents at:");
  console.log(`    ${pc.cyan("https://app.nuro.finance/dashboard/connectors")}`);
  console.log();

  console.log("  v0.2.0 will wire this command directly to:");
  console.log(`    ${pc.dim("POST https://api.nuro.finance/api/connectors/agent")}`);
  console.log(
    `    ${pc.dim("with the flags above + an interactive prompt for anything missing,")}`,
  );
  console.log(`    ${pc.dim("authenticated via `nuro auth login`.")}`);
  console.log();
}
