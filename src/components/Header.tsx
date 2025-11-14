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

import { getUser } from "@/lib";
import { WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/config";
import Link from "next/link";
import {
  UserIcon,
  ArrowLeftEndOnRectangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { DefaultWikiLogo, TransitionLinkButton } from "@/components/ui";
import { getThemeColor } from "@/utils";

export default async function Header() {
  const user = await getUser();

  return (
    <header className="rounded-b-2xl bg-white p-4 sm:rounded-2xl dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xl font-bold">
          <Link href={WIKI_HOMEPAGE_LINK} className="flex items-center gap-1">
            <DefaultWikiLogo
              className="size-6"
              colors={{
                primary: getThemeColor().fill.primary,
                secondary: getThemeColor().fill.secondary,
              }}
            />
            <span
              className={`transition-colors duration-300 ${getThemeColor().text.hover}`}
            >
              {WIKI_NAME}
            </span>
          </Link>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <TransitionLinkButton
                href="/wiki/System:Dashboard"
                className={` ${getThemeColor().bg.base} ${getThemeColor().bg.hover} text-white`}
              >
                <UserIcon className="inline size-5" />
                <span className="font-bold">{user.username}</span>
              </TransitionLinkButton>
            </div>
          ) : (
            <TransitionLinkButton
              href="/wiki/System:SignIn"
              className={`text-white ${getThemeColor().bg.base} ${getThemeColor().bg.hover}`}
            >
              <ArrowLeftEndOnRectangleIcon className="inline size-5" />
              Sign In
            </TransitionLinkButton>
          )}
          <TransitionLinkButton
            title="Search"
            href="/wiki/System:Search"
            className={`aspect-square h-full rounded-full text-white ${getThemeColor().bg.base} ${getThemeColor().bg.hover}`}
          >
            <MagnifyingGlassIcon className="inline size-4" />
          </TransitionLinkButton>
        </div>
      </div>
    </header>
  );
}
