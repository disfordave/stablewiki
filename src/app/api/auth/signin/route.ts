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
import * as jose from "jose";
import bcrypt from "bcryptjs";

const DUMMY_HASH =
  "$2a$10$KIX/8sW3x3lP1n7i6E1w8u3hQKq5N7e2v1a8BqQH6G1nE7Hq1m0y."; // any valid bcrypt hash

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return Response.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    const hash = user?.password ?? DUMMY_HASH;

    if (!user || !(await bcrypt.compare(password, hash))) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    let token;
    try {
      //Creating jwt token
      token = await new jose.SignJWT({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
      })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime(`24h`) // Change this line
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));
    } catch (err) {
      console.log(err);
      return Response.json(
        { error: "Failed to sign in user from JWT" },
        { status: 500 },
      );
    }

    const clientType = request.headers.get("X-Client-Type");
    if (clientType === "mobile") {
      return Response.json(
        {
          message: "Login successful! Happy reading!",
          token: token,
          user: {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            role: user.role,
          },
        },
        { status: 200 },
      );
    }

    const response = Response.json({
      message: "Login successful! Happy reading!",
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        token,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to sign in user" }, { status: 500 });
  }
}
