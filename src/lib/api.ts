/**
 * Thin fetch wrapper for talking to the Nuro backend.
 *
 * Adds Authorization + User-Agent headers, normalizes error handling,
 * and surfaces the underlying HTTP status to the caller so each command
 * can produce the right user-facing message (401 -> 'run nuro auth set',
 * 404 -> 'no such agent', etc).
 *
 * Returns a normalized envelope so commands don't have to repeat the
 * same try/catch boilerplate. ApiError is thrown for non-2xx responses
 * and includes the parsed JSON body when present so callers can pull
 * error.detail / error.error fields.
 */

import { API_BASE, USER_AGENT } from "./config.js";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
}

export async function apiRequest<T = unknown>(
  path: string,
  opts: RequestOptions,
): Promise<T> {
  const url = new URL(path, API_BASE);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) url.searchParams.set(k, v);
    }
  }

  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      Authorization: `Bearer ${opts.token}`,
    },
  };

  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new ApiError(
      0,
      `Network error reaching ${url.host}: ${(err as Error).message}`,
      null,
    );
  }

  // Empty body on 204 is a valid success — used by DELETE endpoints.
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const body = data as { error?: string; detail?: string } | null;
    const message =
      body?.error ?? body?.detail ?? `${res.status} ${res.statusText}`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}
