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

// No "server-only" marker: instrumentation.ts uses this outside the RSC graph.

type Level = "debug" | "info" | "warn" | "error";

const RANK: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      ...("code" in value ? { code: value.code } : {}),
    };
  }
  return value;
}

// Production writes one JSON object per line so log drains can index fields;
// development keeps lines readable.
function write(level: Level, message: string, context?: object) {
  const minimum = RANK[process.env.LOG_LEVEL as Level] ?? RANK.info;
  if (RANK[level] < minimum) {
    return;
  }

  const fields = Object.fromEntries(
    Object.entries(context ?? {}).map(([key, value]) => [
      key,
      serialize(value),
    ]),
  );
  const print =
    level === "warn" || level === "error" ? console.error : console.log;

  if (process.env.NODE_ENV === "production") {
    print(
      JSON.stringify({
        time: new Date().toISOString(),
        level,
        msg: message,
        ...fields,
      }),
    );
  } else if (Object.keys(fields).length > 0) {
    print(`[${level}] ${message}`, fields);
  } else {
    print(`[${level}] ${message}`);
  }
}

export const logger = {
  debug: (message: string, context?: object) =>
    write("debug", message, context),
  info: (message: string, context?: object) => write("info", message, context),
  warn: (message: string, context?: object) => write("warn", message, context),
  error: (message: string, context?: object) =>
    write("error", message, context),
};
