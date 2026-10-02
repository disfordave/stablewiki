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
import {
  deletePage,
  editPage,
  getPage,
  getPageHistory,
  getPageVersion,
} from "@/server/pages";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const ver = searchParams.get("ver");
  const hPage = searchParams.get("hPage");

  try {
    const viewer = await getRequestUser(request);

    // A single old revision
    if (action === "history" && ver) {
      return Response.json({
        page: await getPageVersion(slug.join("/"), Number(ver), viewer),
      });
    }

    // One page of the revision list
    if (action === "history" && hPage) {
      return Response.json({
        page: await getPageHistory(slug.join("/"), Number(hPage), viewer),
      });
    }

    return Response.json({ page: await getPage(slug.join("/"), viewer) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;

  try {
    const revision = await editPage(
      await getRequestUser(request),
      slug.join("/"),
      await readJsonBody(request),
    );
    return Response.json(revision, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

// Moves the page to the trash; editors can restore it from System:Trash
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;

  try {
    const page = await deletePage(
      await getRequestUser(request),
      slug.join("/"),
    );
    return Response.json(page, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
