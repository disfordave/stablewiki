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
import { getDecodedToken } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

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
        accessLevel < 0 ||
        (accessLevel > 9 && accessLevel < 101) ||
        accessLevel > 102
      ) {
        console.log("invalid access level:", accessLevel);
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

      // - 0 for active, 1 for banned
      // - 101 for normal user, 102 for moderators, 103 for editors, 109 for admins

      const userCounter = await prisma.user.count();
      if (userCounter <= 1) {
        return new Response(
          "Cannot change status of the only user in the system",
          { status: 400 },
        );
      }

      if (status < 0 || status < 101 || status > 109) {
        return new Response("Invalid status value", { status: 400 });
      }

      if (status < 2) {
        const updatedUser = await prisma.user.update({
          where: { username: slug[1] },
          data: {
            status,
          },
        });
        return NextResponse.json({ data: updatedUser });
      }

      const updatedUser = await prisma.user.update({
        where: { username: slug[1] },
        data: {
          role:
            status === 101
              ? "USER"
              : status === 102
                ? "MODERATOR"
                : status === 103
                  ? "EDITOR"
                  : "ADMIN",
        },
      });

      return NextResponse.json({ data: updatedUser });
    }
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }

  return NextResponse.json({ data: null });
}
