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

import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { TransitionLinkButton } from "./TransitionButton";

export function BackToTopButton() {
  return (
    <TransitionLinkButton
      href="#top"
      className="fixed end-6 bottom-6 aspect-square size-12 bg-gray-300/50 hover:bg-gray-400/50 dark:bg-gray-700/50 dark:hover:bg-gray-600/50"
      title="Back to Top"
    >
      <ArrowUpIcon className="inline size-5" />
    </TransitionLinkButton>
  );
}
