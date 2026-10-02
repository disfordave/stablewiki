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
import { WIKI_DISABLE_SIGNUP } from "@/config";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/functions/slugify";
import bcrypt from "bcryptjs";

export interface SignUpInput {
  username?: unknown;
  password?: unknown;
  passwordConfirm?: unknown;
  consent?: unknown;
}

export type SignUpResult =
  | {
      ok: true;
      user: {
        id: string;
        username: string;
        avatarUrl: string | null;
        role: Role;
      };
    }
  | { ok: false; status: 400 | 403 | 409; error: string };

export async function registerUser({
  username,
  password,
  passwordConfirm,
  consent,
}: SignUpInput): Promise<SignUpResult> {
  if (WIKI_DISABLE_SIGNUP) {
    return { ok: false, status: 403, error: "User signup has been disabled." };
  }

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof passwordConfirm !== "string" ||
    !username ||
    !password ||
    !passwordConfirm ||
    !consent
  ) {
    return {
      ok: false,
      status: 400,
      error: "Username, password, and consent are required",
    };
  }

  if (password !== passwordConfirm) {
    return { ok: false, status: 400, error: "Passwords do not match" };
  }

  if (!username.match(/^[a-z0-9_]{3,20}$/)) {
    return {
      ok: false,
      status: 400,
      error:
        "Username must be 3-20 characters long and can only contain lower case letters, numbers, and underscores",
    };
  }

  if (password.length < 8) {
    return {
      ok: false,
      status: 400,
      error: "Password must be at least 8 characters long",
    };
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });

  if (existingUser) {
    return { ok: false, status: 409, error: "Username already taken" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.$transaction(async (tx) => {
    const isFirstUser = (await tx.user.count()) === 0;
    const user = await tx.user.create({
      data: {
        username,
        password: hashedPassword,
        role: isFirstUser ? "ADMIN" : "USER",
      },
    });

    // An admin may already have created this user page, so keep it if it exists
    const userPageTitle = `User:${user.username}`;
    await tx.page.upsert({
      where: { slug: slugify(userPageTitle) },
      update: {},
      create: {
        title: userPageTitle,
        content: "",
        slug: slugify(userPageTitle),
        author: { connect: { id: user.id } },
        revisions: {
          create: {
            content: `Hello, ${user.username}!`,
            author: { connect: { id: user.id } },
            summary: `User page for ${user.username}`,
            isRedirect: false,
            redirectTargetSlug: null,
            title: userPageTitle,
          },
        },
        isRedirect: false,
      },
    });

    return user;
  });

  return {
    ok: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      avatarUrl: newUser.avatarUrl,
      role: newUser.role,
    },
  };
}
