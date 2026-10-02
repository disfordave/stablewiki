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

import { SESSION_COOKIE, getSessionUser } from "@/server/auth/session";
import { safeRedirect } from "@/utils";
import { cookies } from "next/headers";

// The signed-in visitor, or null
export const getUser = getSessionUser;

export async function signOutUser() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  safeRedirect(`/wiki/System:SignIn?success=${"Successfully signed out!"}`);
}
