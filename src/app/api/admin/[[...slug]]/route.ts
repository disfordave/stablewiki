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

import { getRequestUser } from "@/server/auth/session";
import { errorResponse, readJsonBody } from "@/server/errors";
import { setPageAccessLevel, setUserStatus } from "@/server/users";
import { NextRequest, NextResponse } from "next/server";

// Admin responses report errors as plain text, as this API always has
const plainText = { plainText: true };

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    const user = await getRequestUser(request);

    if (slug[0] === "pages" && slug.length === 1) {
      const body = (await readJsonBody(request)) as {
        slug?: unknown;
        accessLevel?: unknown;
      } | null;
      const page = await setPageAccessLevel(
        user,
        body?.slug,
        body?.accessLevel,
      );
      return NextResponse.json({ data: page });
    }

    if (slug[0] === "users" && slug.length === 2) {
      const body = (await readJsonBody(request)) as { status?: unknown } | null;
      const updatedUser = await setUserStatus(user, slug[1], body?.status);
      return NextResponse.json({ data: updatedUser });
    }
  } catch (error) {
    return errorResponse(error, plainText);
  }

  return NextResponse.json({ data: null });
}
