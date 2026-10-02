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

import { signInWithPassword } from "@/server/auth/credentials";
import { RATE_LIMITS, checkRateLimit, getClientIp } from "@/server/rateLimit";

export async function POST(request: Request) {
  if (
    !checkRateLimit(
      `signin:${getClientIp(request.headers)}`,
      RATE_LIMITS.signIn,
    )
  ) {
    return Response.json(
      { error: "Too many requests, please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);

  try {
    const result = await signInWithPassword(body?.username, body?.password);

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    const clientType = request.headers.get("X-Client-Type");
    if (clientType === "mobile") {
      return Response.json(
        {
          message: "Login successful! Happy reading!",
          token: result.token,
          user: result.user,
        },
        { status: 200 },
      );
    }

    return Response.json({
      message: "Login successful! Happy reading!",
      user: { ...result.user, token: result.token },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to sign in user" }, { status: 500 });
  }
}
