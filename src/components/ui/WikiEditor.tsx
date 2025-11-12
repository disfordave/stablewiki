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

export function WikiEditor({ defaultValue }: { defaultValue?: string }) {
  return (
    <>
      <textarea
        name="content"
        defaultValue={defaultValue}
        placeholder="Page content in Markdown"
        className="h-[60vh] w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700"
        required
      ></textarea>
      <input
        type="text"
        name="summary"
        placeholder="Edit summary (optional)"
        className="mt-2 w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700"
      />
    </>
  );
}
