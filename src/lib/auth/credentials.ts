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

import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import * as jose from "jose";

const DUMMY_HASH =
  "$2a$10$KIX/8sW3x3lP1n7i6E1w8u3hQKq5N7e2v1a8BqQH6G1nE7Hq1m0y."; // any valid bcrypt hash

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export interface SignedInUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  role: Role;
  createdAt: Date;
}

export type SignInResult =
  | { ok: true; token: string; user: SignedInUser }
  | { ok: false; status: 400 | 401 | 500; error: string };

export async function signInWithPassword(
  username: unknown,
  password: unknown,
): Promise<SignInResult> {
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password
  ) {
    return {
      ok: false,
      status: 400,
      error: "Username and password are required",
    };
  }

  const user = await prisma.user.findUnique({ where: { username } });

  // Always run bcrypt so unknown usernames take as long as wrong passwords
  const passwordMatches = await bcrypt.compare(
    password,
    user?.password ?? DUMMY_HASH,
  );

  if (!user || !passwordMatches) {
    return { ok: false, status: 401, error: "Invalid username or password" };
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in the environment variables.");
    return { ok: false, status: 500, error: "Internal server error" };
  }

  const signedInUser: SignedInUser = {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
  };

  const token = await new jose.SignJWT({ ...signedInUser })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  return { ok: true, token, user: signedInUser };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    // Plain-http self-hosted installs would otherwise never receive the cookie
    secure: process.env.NEXT_PUBLIC_BASE_URL?.startsWith("https://") ?? false,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
