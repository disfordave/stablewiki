import { prisma } from "@/lib/prisma";
import { Page } from "@/lib/types";
import { validAuthorizationWithJwt } from "@/utils/api/authorization";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  try {
    const pages = await prisma.page.findMany({
      where: {
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
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
      pages
        .sort((a, b) => {
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          const searchQuery = query.toLowerCase();

          // Exact match comes first
          if (aTitle === searchQuery) return -1;
          if (bTitle === searchQuery) return 1;

          // Starts with query comes next
          const aStarts = aTitle.startsWith(searchQuery);
          const bStarts = bTitle.startsWith(searchQuery);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          // Otherwise sort alphabetically
          return aTitle.localeCompare(bTitle);
        })
        .map((page) => ({
          id: page.id,
          title: page.title,
          content:
            page.revisions.length > 0
              ? page.revisions[0].content
              : page.content,
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
        })) as Page[],
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, content, author } = await request.json();

  if (!validAuthorizationWithJwt(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || !content || !author) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const page = await prisma.page.create({
      data: {
        title,
        content: "",
        slug: encodeURIComponent(title),
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
