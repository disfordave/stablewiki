/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { WIKI_DISABLE_MEDIA } from "@/config";
import { prisma } from "@/lib/prisma";
import { getDecodedToken, slugify } from "@/utils";
import { writeFile, mkdir } from "fs/promises";
import { NextRequest } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  if (WIKI_DISABLE_MEDIA) {
    return Response.json(
      { error: "Media uploads are disabled" },
      { status: 403 },
    );
  }

  const decodedToken = await getDecodedToken(request);

  if (!decodedToken || !decodedToken.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!decodedToken?.username) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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

  // Only allow PNG, JPG/JPEG, and SVG files
  const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml"];
  if (!media.type || !allowedTypes.includes(media.type)) {
    return Response.json({ error: "Only PNG, JPG, JPEG, and SVG files are allowed" }, { status: 400 });
  }

  // Save the media file to the public directory

  const extension = media.name.split(".").pop();
  const buffer = Buffer.from(await media.arrayBuffer());

  const fullTitle = extension ? `${title}.${extension}` : title;
  console.log({ fullTitle });

  const uploadDir = path.join(process.cwd(), "public", "media");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fullTitle);

  await writeFile(filePath, buffer);

  console.log(`Media file saved to ${filePath}`);

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
