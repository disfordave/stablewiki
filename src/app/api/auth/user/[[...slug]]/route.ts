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
import { PublicUser } from "@/types";
import { NextRequest } from "next/server";
import { User } from "@/types";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { WIKI_DISABLE_SIGNUP } from "@/config";
import { slugify } from "@/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return Response.json(
        { error: "Error! Token was not provided." },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return Response.json(
        { error: "Error! Token was not provided." },
        { status: 401 },
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    try {
      const decodedToken = await jose
        .jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
        .then((result) => result.payload);

      const id = decodedToken.id;
      if (!decodedToken || !id) {
        return Response.json(
          { error: "Invalid or expired token." },
          { status: 403 },
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: id as string },
      });

      if (!user) {
        return Response.json({ error: "User not found." }, { status: 404 });
      }

      return Response.json(
        {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          role: user.role,
          token,
          createdAt: user.createdAt,
          status: user.status,
        } as User,
        { status: 200 },
      );
    } catch (error) {
      console.log(token);
      console.error(error);
      return Response.json(
        { error: "Invalid or expired token." },
        { status: 403 },
      );
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: slug?.[0] as string },
    });

    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    return Response.json(
      {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
        status: user.status,
      } as PublicUser,
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Invalid or expired token." },
      { status: 403 },
    );
  }
}

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

export async function PUT(request: NextRequest): Promise<Response> {
  const body = await request.json();
  const { currentPassword, newPassword, newPasswordConfirm, username } = body;

  if (!currentPassword || !newPassword || !newPasswordConfirm || !username) {
    return Response.json(
      { error: "Current password, new password, and username are required" },
      { status: 400 },
    );
  }

  if (newPassword !== newPasswordConfirm) {
    return Response.json({ error: "Passwords do not match" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters long" },
      { status: 400 },
    );
  }

  // if (!consent) {
  //   return Response.json(
  //     { error: "You must agree to the terms and conditions" },
  //     { status: 400 },
  //   );
  // }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return Response.json(
        { error: "Error! Token was not provided." },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return Response.json(
        { error: "Error! Token was not provided." },
        { status: 401 },
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    const decodedToken = await jose
      .jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
      .then((result) => result.payload);

    if (!decodedToken || !decodedToken.id) {
      return Response.json(
        { error: "Invalid or expired token." },
        { status: 403 },
      );
    }

    if (decodedToken.username !== username) {
      return Response.json(
        { error: "Changing username is not allowed at this time." },
        { status: 400 },
      );
      // await prisma.user.update({
      //   where: { id: decodedToken.id as string },
      //   data: { username },
      // });
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id as string },
    });

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return Response.json(
        { error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return Response.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
