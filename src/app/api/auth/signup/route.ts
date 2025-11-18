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

import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { WIKI_DISABLE_SIGNUP } from "@/config";
import { slugify } from "@/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password, passwordConfirm, consent } = body;

  if (WIKI_DISABLE_SIGNUP) {
    return Response.json(
      { error: "User signup has been disabled." },
      { status: 403 },
    );
  }

  if (!username || !password || !passwordConfirm || !consent) {
    return Response.json(
      { error: "Username, password, and consent are required" },
      { status: 400 },
    );
  }

  if (password !== passwordConfirm) {
    return Response.json({ error: "Passwords do not match" }, { status: 400 });
  }

  if (!username.match(/^[a-z0-9_]{3,20}$/)) {
    return Response.json(
      {
        error:
          "Username must be 3-20 characters long and can only contain lower case letters, numbers, and underscores",
      },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters long" },
      { status: 400 },
    );
  }

  if (!consent) {
    return Response.json(
      { error: "You must agree to the terms and conditions" },
      { status: 400 },
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingUser) {
      return Response.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }

    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword,
        role: isFirstUser ? "ADMIN" : "USER",
      },
    });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    let token;

    if (newUser) {
      const data = { user: newUser };
      // Add user page creation automatically.
      await prisma.page.create({
        data: {
          title: `User:${data.user.username}`,
          content: "",
          slug: slugify(`User:${data.user.username}`),
          author: { connect: { id: data.user.id as string } },
          revisions: {
            create: {
              content: `Hello, ${data.user.username}!`,
              author: { connect: { id: data.user.id as string } },
              summary: `User page for ${data.user.username}`,
              isRedirect: false,
              redirectTargetSlug: null,
              title: `User:${data.user.username}`,
            },
          },
          isRedirect: false,
        },
      });
    }

    const response = Response.json({
      message: "Signup successful! Welcome aboard!",
      user: {
        id: newUser.id,
        username: newUser.username,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        token,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to sign up user" }, { status: 500 });
  }
}
