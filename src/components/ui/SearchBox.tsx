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

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { TransitionFormButton } from "./buttons/TransitionButton";
import { safeRedirect, getThemeColor } from "@/utils";

export async function SearchBox() {
  async function search(formData: FormData) {
    "use server";
    const query = formData.get("search")?.toString() || "";
    // Go to search page
    safeRedirect(`/wiki/System:Search?q=${query}`);
  }

  return (
    <form action={search} className="relative mt-2 flex w-full gap-2">
      <input
        type="text"
        name="search"
        className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor().etc.focusRing} focus:outline-none dark:bg-gray-900`}
        placeholder="Search..."
        required
      />
      <TransitionFormButton
        title="Search"
        useButtonWithoutForm={true}
        className={`absolute end-0 h-full rounded-full  text-white ${getThemeColor().bg.base} ${getThemeColor().bg.hover}`}
      >
        <MagnifyingGlassIcon className="inline size-4" />
      </TransitionFormButton>
    </form>
  );
}
