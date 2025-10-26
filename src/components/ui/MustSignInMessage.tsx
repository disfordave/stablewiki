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

import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/solid";
import { TransitionLinkButton } from "./TransitionButton";

export function MustSignInMessage({
  customMessage,
}: {
  customMessage?: string;
}) {
  return (
    <>
      <div className="">
        <p className="mb-1">
          {customMessage || "You must be signed in to access this page."}
        </p>
        <TransitionLinkButton
          href="/wiki/System_SignIn"
          className="bg-violet-500 text-white hover:bg-violet-600"
        >
          <ArrowLeftEndOnRectangleIcon className="inline size-5" />
          Sign In
        </TransitionLinkButton>
      </div>
    </>
  );
}
