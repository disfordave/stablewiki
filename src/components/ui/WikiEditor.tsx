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

import { getThemeColor } from "@/utils";

export function WikiEditor({ defaultValue }: { defaultValue?: string }) {
  return (
    <>
      <textarea
        name="content"
        defaultValue={defaultValue}
        rows={20}
        placeholder="Page content in Markdown"
        className={`w-full rounded-xl bg-zinc-100 p-4 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
        required
      ></textarea>
      <input
        type="text"
        name="summary"
        placeholder="Edit summary (optional)"
        className={`w-full rounded-full bg-zinc-100 px-4 py-2 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
      />
    </>
  );
}
