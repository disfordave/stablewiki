import { prisma } from "@/lib/prisma";
import { Page } from "@/lib/types";
import { validAuthorizationWithJwt } from "@/utils/api/authorization";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; version: string }> },
) {
  const { slug, version } = await params;

  if (!(await validAuthorizationWithJwt(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const page = await prisma.page.findUnique({
      where: { slug: encodeURIComponent(slug) },
      include: {
        author: true,
        tags: { include: { tag: true } },
        revisions: {
          where: { version: Number(version) },
          include: { author: true },
        },
      },
    });

    if (!page) {
      return Response.json({
        page: null,
      });
    }

    return Response.json({
      page: {
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
        updatedAt:
          page.revisions.length > 0
            ? page.revisions[0].createdAt
            : page.updatedAt,
        tags: page.tags.map((t) => {
          return { id: t.tag.id, name: t.tag.name };
        }),
      } as Page,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}
