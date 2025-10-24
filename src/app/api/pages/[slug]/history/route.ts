import { prisma } from "@/lib/prisma";
import { validAuthorizationWithJwt } from "@/utils/api/authorization";
import { normalizeSlug } from "../route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!(await validAuthorizationWithJwt(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const page = await prisma.page.findUnique({
      where: { slug: encodeURIComponent(normalizeSlug(slug)) },
      include: {
        author: true,
        tags: { include: { tag: true } },
        revisions: {
          orderBy: [{ createdAt: "desc" }, { id: "desc" }], // secondary key
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
        revisions: page.revisions.map((rev) => ({
          author: { id: rev.author.id, username: rev.author.username },
          id: rev.id,
          version: rev.version,
          content: rev.content,
          createdAt: rev.createdAt,
          summary: rev.summary || "No summary provided.",
        })),
        slug: page.slug,
        isRedirect: page.isRedirect,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}
