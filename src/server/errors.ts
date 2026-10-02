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
import { reportError } from "./monitoring";

// An expected failure whose message is safe to show to the user
export class ServiceError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 413 | 429,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

// Matches Prisma error codes (e.g. P2002) and Node errno codes (e.g. EEXIST)
// without importing the generated Prisma client.
export function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

// API response for a failed request; unexpected errors are reported and hidden
export function errorResponse(
  error: unknown,
  { plainText = false }: { plainText?: boolean } = {},
): Response {
  const status = error instanceof ServiceError ? error.status : 500;
  const message =
    error instanceof ServiceError ? error.message : "Internal server error";

  if (!(error instanceof ServiceError)) {
    reportError(error);
  }

  return plainText
    ? new Response(message, { status })
    : Response.json({ error: message }, { status });
}

// Message for a failed server action, which reports back through the URL
export function errorMessage(
  error: unknown,
  fallback = "An unexpected error occurred",
): string {
  if (error instanceof ServiceError) {
    return error.message;
  }
  reportError(error);
  return fallback;
}

// A body that isn't valid JSON is the client's mistake, not a server error
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ServiceError(400, "Invalid JSON body");
  }
}
