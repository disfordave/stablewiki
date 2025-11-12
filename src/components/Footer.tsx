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

import {
  WIKI_COPYRIGHT_HOLDER,
  WIKI_COPYRIGHT_HOLDER_URL,
  WIKI_LICENSE_NAME,
  WIKI_LICENSE_URL,
} from "@/config";

export default function Footer() {
  return (
    <footer className="rounded-t-2xl bg-white px-4 py-8 text-start sm:rounded-2xl dark:bg-gray-800">
      <p className="max-w-lg text-sm text-gray-500">
        All wiki text — except for content on User: pages and Media: pages — is
        licensed under{" "}
        <a
          href={WIKI_LICENSE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          {WIKI_LICENSE_NAME}
        </a>
      </p>

      <p className="mt-4 text-sm text-gray-500">
        &copy; {new Date().getFullYear()}{" "}
        <a
          href={WIKI_COPYRIGHT_HOLDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          {WIKI_COPYRIGHT_HOLDER}
        </a>
        . All rights reserved.
      </p>
      <p className="text-xs text-gray-500" id="down">
        StableWiki Engine v0.0.1
      </p>
    </footer>
  );
}
