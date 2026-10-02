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

import { WIKI_DISABLE_MEDIA, WIKI_MEDIA_ADMIN_ONLY } from "@/config";
import { prisma } from "@/lib/prisma";
import { getDecodedToken, slugify } from "@/utils";
import { hasErrorCode } from "@/utils/api/errorCodes";
import {
  MAX_MEDIA_BYTES,
  MEDIA_SECURITY_HEADERS,
  getMediaContentType,
  getMediaDir,
  getMediaExtension,
  isSafeMediaTitle,
  isUnsafeSvg,
  resolveMediaPath,
  sniffMediaType,
} from "@/utils/api/media";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const noSvg = searchParams.get("noSvg") === "true";

  const filePath =
    slug && slug.length > 0 ? resolveMediaPath(slug.join("/")) : null;

  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    const type = getMediaContentType(filePath);

    if (noSvg && type === "image/svg+xml") {
      const image = sharp(file);
      const metadata = await image.metadata();

      let pipeline = image;

      if ((metadata.width ?? 0) < 1200 || (metadata.height ?? 0) < 630) {
        pipeline = pipeline.resize(1200, 630, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        });
      }

      const output = await pipeline.png().toBuffer();

      return new NextResponse(new Uint8Array(output), {
        headers: { "Content-Type": "image/png", ...MEDIA_SECURITY_HEADERS },
      });
    }

    return new NextResponse(new Uint8Array(file), {
      headers: { "Content-Type": type, ...MEDIA_SECURITY_HEADERS },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;
  if (WIKI_DISABLE_MEDIA) {
    return Response.json(
      { error: "Media uploads are disabled" },
      { status: 403 },
    );
  }

  if (WIKI_MEDIA_ADMIN_ONLY) {
    const decodedToken = await getDecodedToken(request);
    if (!decodedToken || decodedToken.role !== "ADMIN") {
      return Response.json(
        { error: "Only admins can upload media" },
        { status: 403 },
      );
    }
  }

  if (slug && slug.length > 0) {
    return Response.json(
      { error: "Invalid media upload URL" },
      { status: 400 },
    );
  }

  const decodedToken = await getDecodedToken(request);

  if (!decodedToken || !decodedToken.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken?.username) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (decodedToken.status > 0) {
    return Response.json(
      { error: "Banned users cannot upload media" },
      { status: 403 },
    );
  }

  // Refuse oversized bodies before buffering them (the form adds some overhead)
  if (Number(request.headers.get("content-length")) > 2 * MAX_MEDIA_BYTES) {
    return Response.json({ error: "Media file is too large" }, { status: 413 });
  }

  const body = await request.formData();
  const rawTitle = body.get("title");
  const media = body.get("media");

  if (!rawTitle || !media) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (typeof rawTitle !== "string" || !(media instanceof File)) {
    return Response.json({ error: "Invalid media file" }, { status: 400 });
  }

  const title = rawTitle.trim();

  if (!isSafeMediaTitle(title)) {
    return Response.json(
      {
        error:
          "Title cannot start with a dot or contain slashes or control characters",
      },
      { status: 400 },
    );
  }

  if (media.size > MAX_MEDIA_BYTES) {
    return Response.json({ error: "Media file is too large" }, { status: 400 });
  }

  const buffer = Buffer.from(await media.arrayBuffer());

  // Only allow PNG, JPG/JPEG, WEBP, GIF and SVG files, judged by their content
  const type = sniffMediaType(buffer);
  if (!type) {
    return Response.json(
      { error: "Only PNG, JPG, JPEG, WEBP, GIF and SVG files are allowed" },
      { status: 400 },
    );
  }

  if (type === "image/svg+xml" && isUnsafeSvg(buffer.toString("utf8"))) {
    return Response.json(
      {
        error:
          "SVG files cannot contain scripts, event handlers or embedded documents",
      },
      { status: 400 },
    );
  }

  const fullTitle = `${title}.${getMediaExtension(type, media.name)}`;
  const pageSlug = `${"Media:" + slugify(fullTitle)}`;
  const filePath = resolveMediaPath(fullTitle);

  if (!filePath) {
    return Response.json({ error: "Invalid media title" }, { status: 400 });
  }

  const existingPage = await prisma.page.findUnique({
    where: { slug: pageSlug },
    select: { id: true },
  });

  if (existingPage) {
    return Response.json(
      { error: "A media file with this title already exists" },
      { status: 409 },
    );
  }

  try {
    await mkdir(getMediaDir(), { recursive: true });
    // "wx" never overwrites a file that is already on disk
    await writeFile(filePath, buffer, { flag: "wx" });
  } catch (error) {
    if (hasErrorCode(error, "EEXIST")) {
      return Response.json(
        { error: "A media file with this title already exists" },
        { status: 409 },
      );
    }
    console.error(error);
    return Response.json(
      { error: "Failed to store media file" },
      { status: 500 },
    );
  }

  try {
    const page = await prisma.page.create({
      data: {
        title: `Media:${fullTitle}`,
        content: "",
        slug: pageSlug,
        author: { connect: { id: decodedToken.id as string } },
        revisions: {
          create: {
            content: `![[${fullTitle}]]`,
            author: { connect: { id: decodedToken.id as string } },
          },
        },
        isMedia: true,
      },
    });

    return Response.json(page, { status: 201 });
  } catch (error) {
    console.error(error);
    await unlink(filePath).catch(() => undefined);

    if (hasErrorCode(error, "P2002")) {
      return Response.json(
        { error: "A media file with this title already exists" },
        { status: 409 },
      );
    }
    return Response.json({ error: "Failed to create page" }, { status: 500 });
  }
}
