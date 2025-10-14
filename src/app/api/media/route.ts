import { getUser } from "@/lib/auth/functions";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  
  const body = await request.formData();
  const title = body.get("title") as string;
  const slug = body.get("slug") as string;
  const media = body.get("media") as File;
  const user: { id: string; username: string; avatarUrl?: string; role: string } = JSON.parse(body.get("user") as string);
  

  if (!title || !media || !slug || !user) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!(media instanceof File)) {
    return Response.json({ error: "Invalid media file" }, { status: 400 });
  }
  
  // Ensure the media is not too large (e.g., max 5MB)
  if (media.size > 5 * 1024 * 1024) {
    return Response.json({ error: "Media file is too large" }, { status: 400 });
  }

  // Save the media file to the public directory
  
  const buffer = Buffer.from(await media.arrayBuffer());
  const filename = media.name.replaceAll(" ", "_");
  console.log(filename);

  await mkdir("./public/media", { recursive: true });
  const filePath = `/public/media/${Date.now()}-${filename}`;
  const publicFilePath = `/media/${Date.now()}-${filename}`;

  await writeFile(`.${filePath}`, buffer);

  try {
    const page = await prisma.page.create({
      data: {
        title: `Media:${decodeURIComponent(title)}`,
        content: "",
        slug: `MEDIA_PAGE_${slug}`,
        author: { connect: { id: user.id } },
        revisions: {
          create: {
            content: `![${decodeURIComponent(title)}](${publicFilePath})`,
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
