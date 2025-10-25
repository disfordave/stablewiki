import { prisma } from "@/lib/prisma";
import { Page } from "@/lib/types";
import { validAuthorizationWithJwt } from "@/utils/api/authorization";
import { checkRedirect } from "@/utils/api/checkRedirect";

export function normalizeSlug(raw: string) {
  const decoded = decodeURIComponent(raw);
  const trimmed = decoded.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const page = await prisma.page.findUnique({
      where: { slug: encodeURIComponent(normalizeSlug(slug)) },
      include: {
        author: true,
        tags: { include: { tag: true } },
        revisions: {
          orderBy: [{ createdAt: "desc" }, { id: "desc" }], // secondary key
          take: 1,
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
        isRedirect: page.isRedirect,
        redirectTargetSlug:
          page.revisions.length > 0
            ? page.revisions[0].redirectTargetSlug
            : undefined,
      } as Page,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, content, author, summary } = await request.json();

  if (!(await validAuthorizationWithJwt(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || !content || !author) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const redirection = checkRedirect(content, title);

  try {
    const revisionsCount = await prisma.revision.count({
      where: { page: { slug: encodeURIComponent(title) } },
    });

    const page = await prisma.revision.create({
      data: {
        content,
        page: { connect: { slug: encodeURIComponent(title) } },
        author: { connect: { id: author.id } },
        version: revisionsCount + 1,
        summary,
        isRedirect: redirection.isRedirect,
        redirectTargetSlug: redirection.targetSlug,
      },
    });

    const updatedPage = await prisma.page.update({
      where: { slug: encodeURIComponent(title) },
      data: {
        isRedirect: redirection.isRedirect,
      },
    });

    console.log("Updated page redirect status:", updatedPage);

    return Response.json(page, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create page" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const page = await prisma.page.delete({
      where: { slug: encodeURIComponent(slug) },
    });
    return Response.json(page, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
