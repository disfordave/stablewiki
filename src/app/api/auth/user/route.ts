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

    return Response.json(
      {
        id: decodedToken.id,
        username: decodedToken.username,
        avatarUrl: decodedToken.avatarUrl,
        role: decodedToken.role,
        token,
      },
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
