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
import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const noSvg = searchParams.get("noSvg") === "true";
  const forOpenGraph = searchParams.get("forOpenGraph") === "true";

  if (forOpenGraph && noSvg && url && !slug) {
    const res = await fetch(url);
    if (!res.ok) {
      return new Response("Failed to fetch image", { status: 500 });
    }

    const contentType = res.headers.get("content-type") || "";
    const buffer = Buffer.from(await res.arrayBuffer());

    // ✅ If SVG → convert to PNG
    if (contentType.includes("image/svg+xml") || url.endsWith(".svg")) {
      const png = await sharp(buffer).png().toBuffer();

      return new Response(new Uint8Array(png), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // ✅ Otherwise return as-is
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  if (!slug || slug.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filename = slug?.join("/") || "";
  const filePath = path.join(process.cwd(), "public", "media", filename);

  if (!filename) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type =
      ext === ".svg"
        ? "image/svg+xml"
        : ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : ext === ".gif"
              ? "image/gif"
              : ext === ".webp"
                ? "image/webp"
                : "application/octet-stream";

    if (noSvg && type === "image/svg+xml") {
      const image = sharp(file);
      const metadata = await image.metadata();

      let pipeline = image;

      if ((metadata.width ?? 0) < 630 || (metadata.height ?? 0) < 630) {
        pipeline = pipeline.resize(630, 630, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        });
      }

      const output = await pipeline.png().toBuffer();

      return new NextResponse(new Uint8Array(output), {
        headers: { "Content-Type": "image/png" },
      });
    }

    return new NextResponse(new Uint8Array(file), {
      headers: { "Content-Type": type },
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

  const body = await request.formData();
  const title = body.get("title") as string;
  const media = body.get("media") as File;

  if (!title || !media) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!(media instanceof File)) {
    return Response.json({ error: "Invalid media file" }, { status: 400 });
  }

  // Ensure the media is not too large (e.g., max 1MB)
  if (media.size > 1 * 1024 * 1024) {
    return Response.json({ error: "Media file is too large" }, { status: 400 });
  }

  // Only allow PNG, JPG/JPEG, WEBP, GIF and SVG files
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  if (!media.type || !allowedTypes.includes(media.type)) {
    return Response.json(
      { error: "Only PNG, JPG, JPEG, WEBP, GIF and SVG files are allowed" },
      { status: 400 },
    );
  }

  // Save the media file to the public directory

  const extension = media.name.split(".").pop();
  const buffer = Buffer.from(await media.arrayBuffer());

  const fullTitle = extension ? `${title}.${extension.toLowerCase()}` : title;

  const uploadDir = path.join(process.cwd(), "public", "media");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fullTitle);

  await writeFile(filePath, buffer);

  try {
    const page = await prisma.page.create({
      data: {
        title: `Media:${fullTitle}`,
        content: "",
        slug: `${"Media:" + slugify(fullTitle)}`,
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
    return Response.json({ error: "Failed to create page" }, { status: 500 });
  }
}
