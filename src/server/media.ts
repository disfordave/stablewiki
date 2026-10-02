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

import "server-only";
import { prisma } from "@/lib/prisma";
import {
  MAX_MEDIA_BYTES,
  getMediaContentType,
  getMediaExtension,
  isSafeMediaTitle,
  isUnsafeSvg,
  sniffMediaType,
} from "@/utils/api/media";
import { slugify } from "@/utils/functions/slugify";
import sharp from "sharp";
import type { SessionUser } from "./auth/session";
import { getUploadDenial } from "./authz";
import { ServiceError, hasErrorCode } from "./errors";
import { reportError } from "./monitoring";
import { getStorage } from "./storage";

export async function uploadMedia(
  user: SessionUser | null,
  { title: rawTitle, file }: { title: unknown; file: unknown },
) {
  const denial = getUploadDenial(user);
  if (denial || !user) {
    throw new ServiceError(
      denial?.status ?? 401,
      denial?.error ?? "Unauthorized",
    );
  }

  if (!rawTitle || !file) {
    throw new ServiceError(400, "Missing fields");
  }

  if (typeof rawTitle !== "string" || !(file instanceof File)) {
    throw new ServiceError(400, "Invalid media file");
  }

  const title = rawTitle.trim();
  if (!isSafeMediaTitle(title)) {
    throw new ServiceError(
      400,
      "Title cannot start with a dot or contain slashes or control characters",
    );
  }

  if (file.size > MAX_MEDIA_BYTES) {
    throw new ServiceError(400, "Media file is too large");
  }

  const body = new Uint8Array(await file.arrayBuffer());

  // Only allow PNG, JPG/JPEG, WEBP, GIF and SVG files, judged by their content
  const type = sniffMediaType(body);
  if (!type) {
    throw new ServiceError(
      400,
      "Only PNG, JPG, JPEG, WEBP, GIF and SVG files are allowed",
    );
  }

  if (type === "image/svg+xml" && isUnsafeSvg(new TextDecoder().decode(body))) {
    throw new ServiceError(
      400,
      "SVG files cannot contain scripts, event handlers or embedded documents",
    );
  }

  const fileName = `${title}.${getMediaExtension(type, file.name)}`;
  const slug = `Media:${slugify(fileName)}`;

  const existingPage = await prisma.page.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existingPage) {
    throw new ServiceError(409, "A media file with this title already exists");
  }

  const storage = getStorage();
  await storage.create(fileName, body, type);

  try {
    return await prisma.page.create({
      data: {
        title: `Media:${fileName}`,
        content: `![[${fileName}]]`,
        slug,
        author: { connect: { id: user.id } },
        revisions: {
          create: {
            content: `![[${fileName}]]`,
            author: { connect: { id: user.id } },
          },
        },
        isMedia: true,
      },
    });
  } catch (error) {
    // Don't leave an orphaned file behind if the page wasn't created
    await storage
      .remove(fileName)
      .catch((cleanupError) => reportError(cleanupError, { fileName }));
    if (hasErrorCode(error, "P2002")) {
      throw new ServiceError(
        409,
        "A media file with this title already exists",
      );
    }
    throw error;
  }
}

// The stored file, or a PNG rendering of an SVG for places that can't show SVG
export async function readMedia(
  fileName: string,
  { noSvg = false }: { noSvg?: boolean } = {},
): Promise<{ body: Uint8Array; contentType: string } | null> {
  const body = await getStorage().read(fileName);
  if (!body) {
    return null;
  }

  const contentType = getMediaContentType(fileName);
  if (!noSvg || contentType !== "image/svg+xml") {
    return { body, contentType };
  }

  try {
    const image = sharp(body);
    const metadata = await image.metadata();

    let pipeline = image;
    if ((metadata.width ?? 0) < 1200 || (metadata.height ?? 0) < 630) {
      pipeline = pipeline.resize(1200, 630, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      });
    }

    return {
      body: new Uint8Array(await pipeline.png().toBuffer()),
      contentType: "image/png",
    };
  } catch {
    return null;
  }
}

export function deleteMediaFile(fileName: string) {
  return getStorage().remove(fileName);
}
