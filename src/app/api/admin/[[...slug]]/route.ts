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
import { getDecodedToken } from "@/utils";
import { hasErrorCode } from "@/utils/api/errorCodes";
import { NextRequest, NextResponse } from "next/server";

// - 0 for active, 1 for banned
// - 101 for normal user, 102 for moderators, 103 for editors, 109 for admins
const USER_STATUS_CHANGES: Record<number, { status: number } | { role: Role }> =
  {
    0: { status: 0 },
    1: { status: 1 },
    101: { role: "USER" },
    102: { role: "MODERATOR" },
    103: { role: "EDITOR" },
    109: { role: "ADMIN" },
  };

// Never send password hashes or other private fields back to the client
const PUBLIC_USER_FIELDS = {
  id: true,
  username: true,
  role: true,
  status: true,
} as const;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    const decodedToken = await getDecodedToken(request);
    if (!decodedToken || decodedToken.role !== "ADMIN") {
      return new Response("Unauthorized", { status: 401 });
    }

    if (slug[0] === "pages" && slug.length === 1) {
      const body = await request.json();
      const { accessLevel, slug: pageSlug } = body;

      // - 0 for registered users, 1 for moderators, 9 for admins only
      // - 101 for enabled Lounge access, 102 for disabled Lounge

      if (
        !Number.isInteger(accessLevel) ||
        accessLevel < 0 ||
        (accessLevel > 9 && accessLevel < 101) ||
        accessLevel > 102
      ) {
        return new Response("Invalid status value", { status: 400 });
      }

      if (accessLevel >= 101) {
        const updatedPage = await prisma.page.update({
          where: { slug: pageSlug },
          data: {
            loungeDisabled: accessLevel === 102,
          },
        });
        return NextResponse.json({ data: updatedPage });
      }

      const updatedPage = await prisma.page.update({
        where: { slug: pageSlug },
        data: {
          accessLevel,
        },
      });

      return NextResponse.json({ data: updatedPage });
    }

    if (slug[0] === "users" && slug.length === 2) {
      const body = await request.json();
      const { status } = body;

      const change = Number.isInteger(status)
        ? USER_STATUS_CHANGES[status]
        : undefined;

      if (!change) {
        return new Response("Invalid status value", { status: 400 });
      }

      // Prevents admins from locking themselves out of the admin panel
      if (slug[1] === decodedToken.username) {
        return new Response("You cannot change your own status or role", {
          status: 400,
        });
      }

      const userCounter = await prisma.user.count();
      if (userCounter <= 1) {
        return new Response(
          "Cannot change status of the only user in the system",
          { status: 400 },
        );
      }

      const updatedUser = await prisma.user.update({
        where: { username: slug[1] },
        data: change,
        select: PUBLIC_USER_FIELDS,
      });

      return NextResponse.json({ data: updatedUser });
    }
  } catch (error) {
    if (hasErrorCode(error, "P2025")) {
      return new Response("Not Found", { status: 404 });
    }
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }

  return NextResponse.json({ data: null });
}
