import { WIKI_DISABLE_MEDIA } from "@/config";
import { prisma } from "@/lib/prisma";
import { validAuthorizationWithJwt } from "@/utils/api/authorization";
import { writeFile, mkdir } from "fs/promises";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  if (WIKI_DISABLE_MEDIA) {
    return Response.json(
      { error: "Media uploads are disabled" },
      { status: 403 },
    );
  }

  if (!(await validAuthorizationWithJwt(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.formData();
  const title = body.get("title") as string;
  const media = body.get("media") as File;
  const user: {
    id: string;
    username: string;
    avatarUrl?: string;
    role: string;
  } = JSON.parse(body.get("user") as string);

  if (!title || !media || !user) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!(media instanceof File)) {
    return Response.json({ error: "Invalid media file" }, { status: 400 });
  }

  // Ensure the media is not too large (e.g., max 1MB)
  if (media.size > 1 * 1024 * 1024) {
    return Response.json({ error: "Media file is too large" }, { status: 400 });
  }

  // Save the media file to the public directory

  const extension = media.name.split(".").pop();
  const buffer = Buffer.from(await media.arrayBuffer());
  const filename = media.name.replaceAll(" ", "_");
  console.log(filename);

  const fullTitle = extension ? `${title}.${extension}` : title;
  console.log({ fullTitle });
  await mkdir("./public/media", { recursive: true });
  const filePath = `/public/media/${fullTitle}`;

  await writeFile(`.${filePath}`, buffer);

  try {
    const page = await prisma.page.create({
      data: {
        title: `Media:${fullTitle}`,
        content: "",
        slug: `${encodeURIComponent("Media:" + fullTitle)}`,
        author: { connect: { id: user.id } },
        revisions: {
          create: {
            content: `![[${fullTitle}]]`,
            author: { connect: { id: user.id } },
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
