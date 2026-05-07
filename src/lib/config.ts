/**
 * Static config for the Nuro CLI.
 *
 * API_BASE points at the production app for now. v0.2.0 doesn't expose
 * an env-override yet, but a NURO_API_BASE env var will land in v0.3.0
 * for self-hosted instances or staging environments.
 *
 * USER_AGENT identifies CLI traffic in our backend logs so we can
 * separate "dashboard browser" calls from "CLI from someone's terminal"
 * calls when looking at /api/connectors/* analytics later.
 */

import pkg from "../../package.json" with { type: "json" };

export const API_BASE = "https://app.nuro.finance";
export const USER_AGENT = `nuro-cli/${pkg.version} (${process.platform})`;
