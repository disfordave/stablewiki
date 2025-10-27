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

import { TransitionLinkButton } from "@/components/ui";
import { WIKI_HOMEPAGE_LINK } from "@/config";
import { HomeIcon } from "@heroicons/react/24/solid";

const metadata = {
  title: "404 Not Found | StableWiki",
  description: "The page you are looking for does not exist.",
};

export { metadata };

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center bg-white text-center dark:bg-gray-900">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-2 mb-4 text-xl">
        Oops! The page you are looking for does not exist.
      </p>
      <TransitionLinkButton
        href={WIKI_HOMEPAGE_LINK}
        className="bg-violet-500 text-white hover:bg-violet-600"
      >
        <HomeIcon className="inline size-5" />
        Go to Homepage
      </TransitionLinkButton>
    </div>
  );
}
