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

import "server-only";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

export const SESSION_COOKIE = "jwt";

export interface SessionUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  role: Role;
  createdAt: Date;
  status: number;
}

async function verifyToken(token: string): Promise<string | null> {
  if (!process.env.JWT_SECRET) {
    return null;
  }
  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
    );
    return typeof payload.id === "string" ? payload.id : null;
  } catch {
    return null;
  }
}

// The account behind a token, read fresh so bans and role changes apply at once
export async function getUserFromToken(
  token: string | null | undefined,
): Promise<SessionUser | null> {
  const userId = token ? await verifyToken(token) : null;
  if (!userId) {
    return null;
  }
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      status: true,
    },
  });
}

// The signed-in visitor (cookie session), looked up once per request
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  return getUserFromToken(cookieStore.get(SESSION_COOKIE)?.value);
});

// API clients send "Authorization: Bearer <token>"
export function getRequestUser(request: Request): Promise<SessionUser | null> {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  return getUserFromToken(token);
}
