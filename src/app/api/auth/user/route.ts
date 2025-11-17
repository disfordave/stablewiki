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
import { User } from "@/types";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
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
