# @nuro-finance/cli

> Nuro CLI - agentic finance, orchestrated from your terminal.

The neo-bank where your AI agents work for you. 23 chains via LayerZero V2 + Circle CCTP. Visa rails. x402 native. Watched by Mythos.

## Install

```bash
npm install -g @nuro-finance/cli
```

Requires Node 18+. Single-file ESM bundle, zero post-install scripts.

## Quick start

```bash
nuro init             # welcome + sign-up link
nuro docs             # open the Skills catalog
nuro dashboard        # open your dashboard
nuro register-agent   # register an agent connector (preview)
```

## Commands (v0.1.0)

| Command | Description |
|---|---|
| `nuro init` | Welcome message, prints next steps, opens app.nuro.finance |
| `nuro docs` | Opens the Skills catalog (`/skills`) in your browser |
| `nuro dashboard` | Opens your Nuro dashboard in your browser |
| `nuro register-agent` | Preview the agent-registration flow (interactive in v0.2.0) |
| `nuro --help` | Print all commands |
| `nuro --version` | Print the CLI version |

## Roadmap

**v0.2.0 - Authenticated commands:**
- `nuro auth login` - device-code flow, stores token in `~/.nuro/credentials`
- `nuro auth status` - show logged-in state
- `nuro register-agent` - wires through to `POST /api/connectors/agent` for real
- `nuro agents list` - list your registered agents
- `nuro agents revoke <id>` - kill an agent connector

**v0.3.0 - Wallet ergonomics:**
- `nuro wallet status` - balances across all chains
- `nuro wallet transactions` - recent activity
- `nuro topup <agent> <amount>` - fund agent budgets via card or USDC

**v1.0.0 - Production:**
- Shell completions (bash / zsh / fish / pwsh)
- `nuro card status` / `nuro card freeze`
- `nuro markets *` for prediction-market data
- Stable JSON output for scripting (`--json` on every list command)

## Links

- Marketing site: https://app.nuro.finance
- Skills catalog (docs): https://app.nuro.finance/skills
- Agents page: https://app.nuro.finance/agents
- Smart contracts: https://app.nuro.finance/contracts
- Issues: https://github.com/RichardTheBruce/nuro-cli/issues

## License

MIT - see [LICENSE](./LICENSE).
