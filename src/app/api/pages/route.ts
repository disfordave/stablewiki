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
import { createPage, listPages, listRecentRevisions } from "@/server/pages";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hPage = Number(searchParams.get("hPage") || "1");
  const itemsPerPage = parseInt(searchParams.get("itemsPerPage") || "10");

  try {
    if (searchParams.get("action") === "revisions") {
      return Response.json(
        await listRecentRevisions({
          username: searchParams.get("username"),
          hPage,
          itemsPerPage,
        }),
      );
    }

    return Response.json(
      await listPages({
        query: searchParams.get("q") || "",
        userPostsOf: searchParams.get("userPostByUsername"),
        hPage,
        itemsPerPage,
        sortBy:
          searchParams.get("sortBy") === "updatedAt"
            ? "updatedAt"
            : "createdAt",
        exactMatchFirst: !searchParams.get("noAutomaticExactMatch"),
        logSearch: searchParams.get("noSystemLog") !== "true",
      }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const page = await createPage(
      await getRequestUser(request),
      await readJsonBody(request),
    );
    return Response.json(page, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
