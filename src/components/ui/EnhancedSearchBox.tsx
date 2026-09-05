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

import { useSearchParams, useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { TransitionFormButton } from "./buttons/TransitionButton";
import { safeRedirect } from "@/utils/functions/safeRedirect";
import { SubmitEventHandler, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Page } from "@/types";

export function EnhancedSearchBox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropDown, setShowDropDown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropDownRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const searchParamsQueryValue = searchParams.get("q");

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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?q=${encodeURIComponent(searchQuery.trim())}&hPage=${"1"}&noAutomaticExactMatch=true&noSystemLog=true`,
      );
      const data = await res.json();
      return data.pages.filter((p: Page) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    },
    enabled: !!searchQuery,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    listRef.current
      ?.querySelector(`#search-result-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, data]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setShowDropDown(false);
    if (searchQuery.trim() === "") return;
    if (activeIndex > 1) {
      router.push(`/wiki/${data[activeIndex - 2].slug[0]}`);
      return;
    } else if (activeIndex === 1) {
      router.push(`/wiki/${searchQuery}`);
      return;
    }
    safeRedirect(`/wiki/System:Search?q=${searchQuery}`);
  };

  useEffect(() => {
    if (searchParamsQueryValue) {
      inputRef.current?.blur();
    }
  }, [searchParamsQueryValue]);

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="relative mt-2 flex w-full gap-2"
        onMouseEnter={() => setActiveIndex(0)}
      >
        <input
          ref={inputRef}
          autoComplete="off"
          value={searchQuery}
          autoFocus={!searchParamsQueryValue}
          onFocus={handleDropDown}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // A new query means a new list, so the highlight starts over.
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, data.length - 1 + 2));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            }
          }}
          type="text"
          name="enhanced-search"
          className={`w-full rounded-full bg-zinc-100 px-4 py-2 focus:ring-2 focus:ring-zinc-500/25 focus:outline-none dark:bg-zinc-900`}
          placeholder="Search..."
          required
        />
        <TransitionFormButton
          title="Search"
          useButtonWithoutForm={true}
          className={`absolute inset-e-1 h-full rounded-full`}
        >
          <MagnifyingGlassIcon className="inline size-4" />
        </TransitionFormButton>
      </form>
      <div className="relative mt-3">
        {showDropDown && (
          <div
            ref={dropDownRef}
            className="absolute top-0 z-10 max-h-72 w-full overflow-auto rounded-xl border-2 border-zinc-500/25 bg-zinc-100 shadow-md dark:bg-zinc-900"
          >
            <ul className="flex flex-col gap-0" ref={listRef}>
              {searchQuery.trim() !== "" && (
                <li
                  role="option"
                  onMouseEnter={() => setActiveIndex(1)}
                  aria-selected={1 === activeIndex}
                  id={`search-result-1`}
                >
                  <Link
                    href={`/wiki/${searchQuery}`}
                    className={`px-4 py-3 ${activeIndex === 1 ? "bg-zinc-500/25" : ""} inline-block w-full`}
                  >
                    <p className="opacity-75">
                      Go to &quot;{searchQuery}&quot;
                    </p>
                  </Link>
                </li>
              )}
              {isFetching ? (
                <li className={`px-4 py-3`}>
                  <p>Loading...</p>
                </li>
              ) : data.length > 0 ? (
                data.map((page: Page, position: number) => (
                  <li
                    role="option"
                    onMouseEnter={() => setActiveIndex(position + 2)}
                    aria-selected={position + 2 === activeIndex}
                    key={page.title}
                    id={`search-result-${position + 2}`}
                  >
                    <Link
                      href={`/wiki/${page.slug[0]}`}
                      className={`px-4 py-3 ${activeIndex === position + 2 ? "bg-zinc-500/25" : ""} inline-block w-full`}
                    >
                      <p>{page.title}</p>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3">
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
