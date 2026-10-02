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
import { isSafeMediaTitle } from "@/utils/api/media";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { ServiceError, hasErrorCode } from "../errors";
import type { StorageDriver } from "./types";

const MISSING_FILE_CODES = ["ENOENT", "ENOTDIR", "EISDIR"];

// Files on the server's disk. Needs persistent storage, so not for serverless.
// The turbopackIgnore hints mark these paths as runtime-only; without them the
// bundler can't tell where files live and ships the whole project to be safe.
export function createLocalStorage(rootDir: string): StorageDriver {
  const root = path.resolve(rootDir);

  // Null for anything that would resolve outside the storage directory
  const resolveKey = (key: string) => {
    if (!isSafeMediaTitle(key)) {
      return null;
    }
    const resolved = path.resolve(root, key);
    return resolved.startsWith(root + path.sep) ? resolved : null;
  };

  return {
    async create(key, body) {
      const filePath = resolveKey(key);
      if (!filePath) {
        throw new ServiceError(400, "Invalid media title");
      }
      await mkdir(root, { recursive: true });
      try {
        // "wx" never overwrites a file that is already on disk
        await writeFile(/* turbopackIgnore: true */ filePath, body, {
          flag: "wx",
        });
      } catch (error) {
        if (hasErrorCode(error, "EEXIST")) {
          throw new ServiceError(
            409,
            "A media file with this title already exists",
          );
        }
        throw error;
      }
    },

    async read(key) {
      const filePath = resolveKey(key);
      if (!filePath) {
        return null;
      }
      try {
        return new Uint8Array(
          await readFile(/* turbopackIgnore: true */ filePath),
        );
      } catch (error) {
        if (MISSING_FILE_CODES.some((code) => hasErrorCode(error, code))) {
          return null;
        }
        throw error;
      }
    },

    async remove(key) {
      const filePath = resolveKey(key);
      if (!filePath) {
        return;
      }
      try {
        await unlink(/* turbopackIgnore: true */ filePath);
      } catch (error) {
        if (!hasErrorCode(error, "ENOENT")) {
          throw error;
        }
      }
    },
  };
}
