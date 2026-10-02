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
import { ServiceError, errorResponse } from "@/server/errors";
import { readMedia, uploadMedia } from "@/server/media";
import { MAX_MEDIA_BYTES, MEDIA_SECURITY_HEADERS } from "@/utils/api/media";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;
  const noSvg = request.nextUrl.searchParams.get("noSvg") === "true";

  if (!slug || slug.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const media = await readMedia(slug.join("/"), { noSvg });
    if (!media) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(media.body), {
      headers: { "Content-Type": media.contentType, ...MEDIA_SECURITY_HEADERS },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;

  if (slug && slug.length > 0) {
    return Response.json(
      { error: "Invalid media upload URL" },
      { status: 400 },
    );
  }

  // Refuse oversized bodies before buffering them (the form adds some overhead)
  if (Number(request.headers.get("content-length")) > 2 * MAX_MEDIA_BYTES) {
    return Response.json({ error: "Media file is too large" }, { status: 413 });
  }

  try {
    const user = await getRequestUser(request);
    const form = await request.formData().catch(() => {
      throw new ServiceError(400, "Invalid form data");
    });

    const page = await uploadMedia(user, {
      title: form.get("title"),
      file: form.get("media"),
    });
    return Response.json(page, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
