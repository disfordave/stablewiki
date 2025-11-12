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
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

export function BackToTopButton() {
  return (
    <div className="fixed end-6 bottom-6 flex flex-col gap-1 rounded-full bg-gray-300/50 p-1 dark:bg-gray-700/50">
      <Link
        className={`flex w-fit cursor-pointer rounded-full font-medium text-nowrap opacity-50 transition-opacity duration-300 hover:opacity-75`}
        href="#up"
        title="Back to Top"
        aria-label="Back to Top"
      >
        <ArrowUpCircleIcon className="-m-1 inline size-12" />
      </Link>
      <Link
        className={`flex w-fit cursor-pointer rounded-full font-medium text-nowrap opacity-50 transition-opacity duration-300 hover:opacity-75`}
        href="#down"
        aria-label="Back to Bottom"
        title="Back to Bottom"
      >
        <ArrowDownCircleIcon className="-m-1 inline size-12" />
      </Link>
    </div>
  );
}
