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

// Where uploaded media lives. Keys are validated file names, never paths.
export interface StorageDriver {
  // Stores a new object; a ServiceError (409) means the key is already taken
  create(key: string, body: Uint8Array, contentType: string): Promise<void>;
  // Null when the object doesn't exist or the key is invalid
  read(key: string): Promise<Uint8Array | null>;
  remove(key: string): Promise<void>;
}
