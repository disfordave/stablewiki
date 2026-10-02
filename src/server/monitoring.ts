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
import { logger } from "./logger";

// Logs an unexpected error and, when SENTRY_DSN is set, sends it to Sentry.
// Expected failures (bad input, permissions) are ServiceErrors and skip this.
export function reportError(error: unknown, context: object = {}) {
  logger.error(error instanceof Error ? error.message : "Unexpected error", {
    ...context,
    error,
  });

  if (process.env.SENTRY_DSN) {
    import("@sentry/nextjs")
      .then((Sentry) =>
        Sentry.captureException(error, { extra: { ...context } }),
      )
      .catch(() => undefined);
  }
}
