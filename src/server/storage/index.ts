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
import path from "path";
import { createLocalStorage } from "./local";
import { createS3StorageFromEnv } from "./s3";
import type { StorageDriver } from "./types";

export type { StorageDriver } from "./types";

let storage: StorageDriver | undefined;

// STORAGE_DRIVER=s3 for object storage (needed on serverless hosts),
// otherwise files go to STORAGE_LOCAL_DIR or public/media.
export function getStorage(): StorageDriver {
  storage ??=
    process.env.STORAGE_DRIVER === "s3"
      ? createS3StorageFromEnv()
      : createLocalStorage(
          process.env.STORAGE_LOCAL_DIR ||
            path.join(
              /* turbopackIgnore: true */ process.cwd(),
              "public",
              "media",
            ),
        );
  return storage;
}
