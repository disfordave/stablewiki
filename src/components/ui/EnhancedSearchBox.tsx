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

"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { TransitionFormButton } from "./buttons/TransitionButton";
import { safeRedirect } from "@/utils";
import { SubmitEventHandler, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Page } from "@/types";

export function EnhancedSearchBox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropDown, setShowDropDown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropDownRef = useRef<HTMLInputElement>(null);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
    safeRedirect(`/wiki/System:Search?q=${searchQuery}`);
  };

  const handleDropDown = () => setShowDropDown((state) => !state);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropDownRef, inputRef]);

  const { data = [], isFetching } = useQuery({
    queryKey: ["pages", searchQuery],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?q=${encodeURIComponent(searchQuery.trim())}&hPage=${"1"}&noExactMatch=true`,
      );
      const data = await res.json();
      return data.pages.filter((p: Page) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    },
    enabled: !!searchQuery,
    staleTime: 1000 * 60,
  });

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative mt-2 flex w-full gap-2">
        <input
          ref={inputRef}
          autoComplete="off"
          value={searchQuery}
          onFocus={handleDropDown}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          name="enhanced-search"
          className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 focus:ring-zinc-500/50 focus:outline-none dark:bg-zinc-900`}
          placeholder="Search..."
          required
        />
        <TransitionFormButton
          title="Search"
          useButtonWithoutForm={true}
          className={`absolute inset-e-0 h-full rounded-full`}
        >
          <MagnifyingGlassIcon className="inline size-4" />
        </TransitionFormButton>
      </form>
      <div className="relative mt-2">
        {showDropDown && (
          <div
            ref={dropDownRef}
            className="absolute top-0 z-10 max-h-60 w-full overflow-auto rounded-xl bg-zinc-100 p-4 shadow-md dark:bg-zinc-900"
          >
            <ul className="flex flex-col gap-2">
              {searchQuery.trim() !== "" && (
                <li>
                  <Link
                    href={`/wiki/${searchQuery}`}
                    className="opacity-80 hover:underline"
                  >
                    <p>Go to &quot;{searchQuery}&quot;</p>
                  </Link>
                </li>
              )}
              {isFetching ? (
                <li>
                  <p>Loading...</p>
                </li>
              ) : data.length > 0 ? (
                data.map((page: Page) => (
                  <li key={page.title}>
                    <Link
                      href={`/wiki/${page.slug[0]}`}
                      className="hover:underline"
                    >
                      <p>{page.title}</p>
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  {searchQuery.trim() !== "" ? (
                    <p>No results found.</p>
                  ) : (
                    <p>Start searching!</p>
                  )}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
