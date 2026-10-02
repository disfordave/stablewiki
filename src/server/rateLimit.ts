/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "server-only";
// Fixed-window counters kept in process memory. Fine for a single self-hosted
// instance; deployments running several instances need a shared store.
const buckets = new Map<string, { count: number; resetTime: number }>();
const MAX_TRACKED_KEYS = 10_000;

export const RATE_LIMITS = {
  signIn: { limit: 25, windowMs: 15 * 60 * 1000 },
  signUp: { limit: 10, windowMs: 60 * 60 * 1000 },
};

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): boolean {
  const now = Date.now();
  const record = buckets.get(key);

  if (!record || now > record.resetTime) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      pruneExpired(now);
    }
    buckets.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

function pruneExpired(now: number) {
  for (const [key, record] of buckets) {
    if (now > record.resetTime) {
      buckets.delete(key);
    }
  }
}

export function resetRateLimits() {
  buckets.clear();
}

// Must be called with the headers of the visitor's own request. Server-side
// fetches to this app's API arrive with the server's address instead.
export function getClientIp(headers: {
  get(name: string): string | null;
}): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : headers.get("x-real-ip");
  return ip || "unknown";
}
