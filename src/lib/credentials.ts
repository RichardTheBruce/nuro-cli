/**
 * Credential storage for the Nuro CLI.
 *
 * Tokens live in `~/.nuro/credentials` as a single-line JSON file:
 *   {"token": "...", "savedAt": "2026-05-07T..."}
 *
 * Why a JSON file under the home dir (vs. OS keychain or env vars):
 *   - Standard practice for CLI tools (gh, aws, kubectl all do this).
 *   - Cross-platform with zero native deps. Keychain integration would
 *     require platform-specific binaries (macOS Keychain, Windows
 *     Credential Manager, libsecret on Linux) and ship size we don't
 *     want in a 4KB tarball.
 *   - File mode 0600 enforces owner-only read/write on POSIX. Windows
 *     uses NTFS ACLs — same effect for the user's home dir.
 *
 * NURO_KEY env var takes precedence over the file. This is the standard
 * CI/CD escape hatch (export NURO_KEY=..., done) and matches gh's
 * GITHUB_TOKEN convention.
 */

import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const NURO_DIR = join(homedir(), ".nuro");
const CREDS_PATH = join(NURO_DIR, "credentials");

interface CredentialsFile {
  token: string;
  savedAt: string;
}

/**
 * Resolve the active token. Checks env first, then the credentials file.
 * Returns null if neither is set so callers can produce a useful error.
 */
export async function getToken(): Promise<string | null> {
  const envToken = process.env.NURO_KEY?.trim();
  if (envToken) return envToken;

  try {
    const raw = await fs.readFile(CREDS_PATH, "utf8");
    const data = JSON.parse(raw) as CredentialsFile;
    return data.token || null;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Persist a token to ~/.nuro/credentials with 0600 perms.
 * Overwrites any existing token without warning — `auth set` is the
 * intentional rotate path.
 */
export async function saveToken(token: string): Promise<void> {
  await fs.mkdir(NURO_DIR, { recursive: true, mode: 0o700 });
  const data: CredentialsFile = {
    token: token.trim(),
    savedAt: new Date().toISOString(),
  };
  await fs.writeFile(CREDS_PATH, JSON.stringify(data), { mode: 0o600 });
}

/**
 * Wipe the credentials file. Idempotent — silent if no file exists.
 */
export async function clearToken(): Promise<void> {
  try {
    await fs.unlink(CREDS_PATH);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") throw err;
  }
}

/** Path of the credentials file, exposed for `auth status` display. */
export const credentialsPath = CREDS_PATH;
