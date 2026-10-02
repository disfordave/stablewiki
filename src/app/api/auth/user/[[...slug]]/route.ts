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

import { registerUser } from "@/server/auth/registration";
import { getRequestUser } from "@/server/auth/session";
import { errorResponse, readJsonBody } from "@/server/errors";
import { RATE_LIMITS, checkRateLimit, getClientIp } from "@/server/rateLimit";
import { changePassword, getPublicUser } from "@/server/users";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  try {
    // The account behind the bearer token
    if (!slug || slug.length === 0) {
      const token = request.headers.get("Authorization")?.split(" ")[1];
      if (!token) {
        return Response.json(
          { error: "Error! Token was not provided." },
          { status: 401 },
        );
      }

      const user = await getRequestUser(request);
      if (!user) {
        return Response.json(
          { error: "Invalid or expired token." },
          { status: 403 },
        );
      }

      return Response.json({ ...user, token }, { status: 200 });
    }

    // Anyone's public profile
    const user = await getPublicUser(slug[0]);
    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }
    return Response.json(user, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  if (
    !checkRateLimit(
      `signup:${getClientIp(request.headers)}`,
      RATE_LIMITS.signUp,
    )
  ) {
    return Response.json(
      { error: "Too many requests, please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await registerUser(body);

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json({
      message: "Signup successful! Welcome aboard!",
      user: result.user,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to sign up user" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return Response.json(
        { error: "Invalid or expired token." },
        { status: 403 },
      );
    }

    const body = (await readJsonBody(request)) as { username?: unknown } | null;
    if (body?.username !== user.username) {
      return Response.json(
        { error: "Changing username is not allowed at this time." },
        { status: 400 },
      );
    }

    await changePassword(user, body);
    return Response.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
