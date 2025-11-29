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

export default function Comments() {
  return (
    <>
      <div>
        <div className="mt-6 mb-4 h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-900"></div>
        <h3 className="mb-4 text-2xl font-bold">Comments (14)</h3>
        <ul>
          <li>
            <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
              <p className="font-medium">
                Hello, this is a placeholder for comments functionality.
              </p>
              <p className="text-sm text-zinc-500">By Commenter123</p>
              <p className="text-sm text-zinc-500">
                {new Date().toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZoneName: "short",
                })}
              </p>
              <div>
                <button>Like (5)</button>
                <button className="ms-4">Dislike (2)</button>
                <button className="ms-4">Reply (3)</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}
