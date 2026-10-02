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
  addReaction,
  createComment,
  deleteComment,
  editComment,
  getComment,
  getThread,
  listRecentComments,
  listThreads,
  removeReaction,
} from "@/server/lounge";
import { NextRequest, NextResponse } from "next/server";

// Lounge responses report errors as plain text, as this API always has
const plainText = { plainText: true };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const hPage = Number(searchParams.get("hPage") || "1");
  const sortBy = searchParams.get("sortBy") === "likes" ? "likes" : "createdAt";

  try {
    if (!slug || slug.length === 0) {
      return NextResponse.json(
        await listRecentComments({
          username: searchParams.get("username"),
          onlyRoot: searchParams.get("onlyRoot") === "true",
          excludeDeleted: searchParams.get("noDeletedLounges") === "true",
          hPage,
          sortBy,
        }),
      );
    }

    if (slug.length === 1) {
      return NextResponse.json(await listThreads(slug[0], { hPage, sortBy }));
    }

    if (slug.length === 3 && slug[1] === "single") {
      const comment = await getComment(slug[0], slug[2]);
      if (!comment) {
        return new Response("Comment not found", { status: 404 });
      }
      return NextResponse.json({ data: comment, locationUrl: null });
    }

    const thread = await getThread(slug[0], slug[1], { hPage, sortBy });
    if (!thread) {
      return new Response("Comment not found", { status: 404 });
    }
    return NextResponse.json(thread);
  } catch (error) {
    return errorResponse(error, plainText);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  try {
    const user = await getRequestUser(request);
    const body = await readJsonBody(request);

    if (slug && slug[0] === "reactions") {
      const reaction = await addReaction(user, body);
      return NextResponse.json(
        { id: reaction.id },
        { status: reaction.created ? 201 : 200 },
      );
    }

    const comment = await createComment(user, body);
    return NextResponse.json({ id: comment.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error, plainText);
  }
}

export async function PUT(request: Request) {
  try {
    const comment = await editComment(
      await getRequestUser(request),
      await readJsonBody(request),
    );
    return NextResponse.json({ id: comment.id }, { status: 200 });
  } catch (error) {
    return errorResponse(error, plainText);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  try {
    const user = await getRequestUser(request);
    const body = (await readJsonBody(request)) as {
      id?: unknown;
      reactionId?: unknown;
    } | null;

    if (slug && slug[0] === "reactions") {
      await removeReaction(user, body?.reactionId);
      return new Response("Reaction deleted successfully", { status: 200 });
    }

    await deleteComment(user, body?.id);
    return new Response("Comment deleted successfully", { status: 200 });
  } catch (error) {
    return errorResponse(error, plainText);
  }
}
