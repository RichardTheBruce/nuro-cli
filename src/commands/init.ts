/**
 * `nuro init`. Welcome + onboarding intro.
 *
 * v0.1.0 scope: print a friendly intro, point users to the dashboard
 * sign-up flow. No credential file is written yet. That lands when
 * `nuro auth login` ships in v0.2.0 with the device-code flow.
 *
 * The print order matters: we want users to see (in order) what Nuro
 * is, what they can do from the CLI today, what's coming next, and
 * exactly which URL to visit to get started.
 */

import pc from "picocolors";
import open from "open";

// Compact wordmark. Clean, terminal-friendly, ASCII-only so it renders
// in any locale + any monospace. The full graphic identity lives at
// app.nuro.finance. The CLI just needs a recognizable header.
const NURO_LOGO = `
  ${pc.bold(pc.cyan("nuro"))} ${pc.dim("·")} ${pc.dim("agentic finance, orchestrated")}
  ${pc.dim("─".repeat(48))}
`;

export async function initCommand(): Promise<void> {
  console.log(NURO_LOGO);
  console.log(pc.bold("  Welcome to Nuro."));
  console.log();
  console.log(`  ${pc.dim("The neo-bank where your AI agents work for you.")}`);
  console.log(
    `  ${pc.dim("23 chains via LayerZero V2 + Circle CCTP. Visa rails. x402 native.")}`,
  );
  console.log();
  console.log(pc.bold("  Today you can:"));
  console.log(`    ${pc.cyan("nuro docs")}             ${pc.dim("·  open the Skills catalog")}`);
  console.log(`    ${pc.cyan("nuro dashboard")}        ${pc.dim("·  open your dashboard")}`);
  console.log(`    ${pc.cyan("nuro register-agent")}   ${pc.dim("·  register an agent connector")}`);
  console.log();
  console.log(pc.bold("  Coming in v0.2.0:"));
  console.log(`    ${pc.dim("nuro auth login        ·  terminal token via device-code flow")}`);
  console.log(`    ${pc.dim("nuro agents list       ·  list your registered agents")}`);
  console.log(`    ${pc.dim("nuro wallet status     ·  balances across chains")}`);
  console.log(`    ${pc.dim("nuro topup <agent>     ·  fund agent budgets via card or USDC")}`);
  console.log();
  console.log(pc.bold("  Next step:"));
  console.log(
    `    Sign up at ${pc.cyan("https://app.nuro.finance")} ${pc.dim("(opening in your browser...)")}`,
  );
  console.log();

  // Best-effort browser open. Don't block the welcome flow if it fails
  // (e.g. headless server, WSL without xdg-open).
  try {
    await open("https://app.nuro.finance");
  } catch {
    console.log(
      pc.dim(
        `  (Couldn't auto-open. Visit ${pc.cyan("https://app.nuro.finance")} manually.)`,
      ),
    );
  }
}
