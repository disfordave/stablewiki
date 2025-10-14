import { prisma } from "@/lib/prisma";
import { Page } from "@/lib/types";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      include: {
        author: true,
        tags: { include: { tag: true } },
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { author: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(
      pages.map((page) => ({
        id: page.id,
        title: page.title,
        content:
          page.revisions.length > 0 ? page.revisions[0].content : page.content,
        slug: page.slug,
        author:
          page.revisions.length > 0
            ? {
                id: page.revisions[0].author.id,
                username: page.revisions[0].author.username,
              }
            : { id: page.author.id, username: page.author.username },
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        tags: page.tags.map((t) => {
          return { id: t.tag.id, name: t.tag.name };
        }),
      })) as Page[]
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, content, slug, author } = await request.json();

  if (!title || !content || !slug || !author) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const page = await prisma.page.create({
      data: {
        title: decodeURIComponent(title),
        content: "",
        slug: slug,
        author: { connect: { id: author.id } },
        revisions: {
          create: { content, author: { connect: { id: author.id } } },
        },
      },
    });

    return Response.json(page, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create page" }, { status: 500 });
  }
}
