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
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/solid";
import { TransitionLinkButton } from "./buttons/TransitionButton";

export default function Pagination({
  currentPage,
  totalPages,
  slug,
  trailingHash = "",
}: {
  currentPage: number;
  totalPages: number;
  slug: string;
  trailingHash?: string;
}) {
  return (
    <>
      <div className="mt-4 flex items-center justify-center gap-2">
        <TransitionLinkButton
          href={`/wiki/${slug}${1}${trailingHash}`}
          className={`w-fit bg-zinc-500 text-white hover:bg-zinc-600 ${(currentPage === 1 || currentPage === 2) && "invisible"}`}
          title="First Page"
        >
          <ChevronDoubleLeftIcon className="inline size-5" />
        </TransitionLinkButton>
        <TransitionLinkButton
          href={`/wiki/${slug}${currentPage - 1}${trailingHash}`}
          className={`w-fit bg-zinc-500 text-white hover:bg-zinc-600 ${currentPage <= 1 && "invisible"}`}
          title="Previous Page"
        >
          <ChevronLeftIcon className="inline size-5" />
        </TransitionLinkButton>
        <p className="tabular-nums">{currentPage + " / " + totalPages}</p>
        <TransitionLinkButton
          href={`/wiki/${slug}${currentPage + 1}${trailingHash}`}
          className={`w-fit bg-zinc-500 text-white hover:bg-zinc-600 ${currentPage >= totalPages && "invisible"}`}
          title="Next Page"
        >
          <ChevronRightIcon className="inline size-5" />
        </TransitionLinkButton>
        <TransitionLinkButton
          href={`/wiki/${slug}${totalPages}${trailingHash}`}
          className={`w-fit bg-zinc-500 text-white hover:bg-zinc-600 ${(currentPage >= totalPages || currentPage === totalPages - 1) && "invisible"}`}
          title="Last Page"
        >
          <ChevronDoubleRightIcon className="inline size-5" />
        </TransitionLinkButton>
      </div>
    </>
  );
}
