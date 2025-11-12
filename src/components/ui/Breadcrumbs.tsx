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

import Link from "next/link";

export function Breadcrumbs({
  slug,
  titles,
}: {
  slug: string[];
  titles: string[];
}) {
  return (
    <>
      <p className="text-sm">
        {slug.map((_, index) => (
          <span key={index}>
            <Link
              href={`/wiki/${decodeURIComponent(slug.slice(0, index + 1).join("/"))}`}
              className={`${
                index === slug.length - 1 ? "font-semibold" : "font-medium"
              } ${slug.length - 1 === index ? "text-gray-500" : "text-blue-600 hover:underline dark:text-blue-500"}`}
            >
              {titles[index]}
            </Link>
            {index < slug.length - 1 && " / "}
          </span>
        ))}
      </p>
    </>
  );
}
