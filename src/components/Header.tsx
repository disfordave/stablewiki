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

import { getUser } from "@/lib";
import { WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/config";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  UserIcon,
  MagnifyingGlassIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { TransitionLinkButton, TransitionFormButton } from "@/components/ui";
import Image from "next/image";

export default async function Header() {
  const user = await getUser();

  async function search(formData: FormData) {
    "use server";
    const query = formData.get("search")?.toString() || "";
    // Go to search page
    redirect(`/wiki/System:Search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="rounded-b-2xl bg-white p-4 sm:rounded-2xl dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xl font-bold">
          <Link href={WIKI_HOMEPAGE_LINK} className="flex items-center gap-1">
            <Image
              src="/icon.svg"
              alt={`Logo of ${WIKI_NAME}`}
              width={24}
              height={24}
            />
            <span className="transition-colors duration-300 hover:text-violet-500">
              {WIKI_NAME}
            </span>
          </Link>
        </p>
        {user.username ? (
          <div className="flex items-center gap-2">
            <TransitionLinkButton
              href="/wiki/System:Dashboard"
              className="bg-violet-500 text-white hover:bg-violet-600"
            >
              <UserIcon className="inline size-5" />
              <span className="font-bold">{user.username}</span>
            </TransitionLinkButton>
          </div>
        ) : (
          <TransitionLinkButton
            href="/wiki/System:SignIn"
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            <ArrowLeftEndOnRectangleIcon className="inline size-5" />
            Sign In
          </TransitionLinkButton>
        )}
      </div>
      <form action={search} className="relative mt-2 flex w-full gap-2">
        <input
          type="text"
          name="search"
          className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
          placeholder="Search..."
          required
        />
        <TransitionFormButton
          title="Search"
          useButtonWithoutForm={true}
          className="absolute end-0 h-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
        >
          <MagnifyingGlassIcon className="inline size-4" />
        </TransitionFormButton>
      </form>
    </header>
  );
}
