/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Link from "next/link";
import { slugify } from "@/utils";

function RedirectedFromMessage({ from }: { from: string | string[] }) {
  return (
    <div className="mt-2 rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
      <p className="">
        You were redirected here from{" "}
        <Link
          href={`/wiki/${Array.isArray(from) ? slugify(from.join("/")) : slugify(from)}?preventRedirect=true`}
          className="underline"
        >
          {Array.isArray(from)
            ? from.map((s) => decodeURIComponent(s)).join("/")
            : decodeURIComponent(from)}
        </Link>
        .
      </p>
    </div>
  );
}

export { RedirectedFromMessage };
