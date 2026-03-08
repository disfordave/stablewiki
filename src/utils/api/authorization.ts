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

import { NextRequest } from "next/server";
import * as jose from "jose";
import { User } from "@/types";
import { prisma } from "@/lib/prisma";

export async function validAuthorizationWithJwt(
  request: NextRequest | Request,
): Promise<boolean> {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return false;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return false;
    }

    if (!process.env.JWT_SECRET) {
      return false;
    }

    const decodedToken = await jose
      .jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
      .then((result) => result.payload);

    if (!decodedToken) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error validating JWT:", error);
    return false;
  }
}

export async function getDecodedToken(
  request: NextRequest | Request,
): Promise<User | null> {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return null;
    }

    if (!process.env.JWT_SECRET) {
      return null;
    }

    const decodedToken = await jose
      .jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
      .then((result) => result.payload);

    const id = decodedToken.id;
    if (!decodedToken || !id) {
      return null;
    }

    const response = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        status: true,
      },
    });

    if (!response) {
      return null;
    }

    return {
      id: response.id,
      username: response.username,
      avatarUrl: response.avatarUrl,
      role: response.role,
      createdAt: response.createdAt,
      status: response.status,
    } as User;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}
