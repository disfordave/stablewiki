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

import { Page } from "@/types";
import Link from "next/link";

function PageDate({ page, isOld }: { page: Page; isOld: boolean }) {
  return (
    <p className="text-sm text-gray-500">
      {isOld ? "Edited by " : "Last edited by "}{" "}
      {page.author ? (
        <Link
          className="font-semibold hover:underline"
          href={`/wiki/User:${page.author.username}`}
        >
          {page.author.username}
        </Link>
      ) : (
        <span className="font-semibold">Unknown</span>
      )}{" "}
      on{" "}
      <span className="font-semibold">
        {new Date(page.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
          timeZone: "UTC",
        })}
      </span>
    </p>
  );
}

export { PageDate };
