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

import { safeRedirect } from "@/utils";
import { cookies } from "next/headers";

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    return { error: "User not authenticated" };
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    return { error: "Failed to fetch user" };
  }

  const user = await res.json();
  return user;
}

export async function signOutUser() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("jwt");
  safeRedirect(`/wiki/System:SignIn?success=${"Successfully signed out!"}`);
}
