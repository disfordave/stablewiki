import { prisma } from "@/lib/prisma";
import { Page } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const pages = await prisma.page.findUnique({
      where: { slug: slug },
      include: { author: true, tags: { include: { tag: true } }, revisions: {
          orderBy: { createdAt: "desc" },
          take: 1, 
          include: { author: true },
        }, },
    });

    if (!pages) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }
    return Response.json({ 
      id: pages.id,
      title: pages.title,
      content: pages.revisions.length > 0 ? pages.revisions[0].content : pages.content,
      slug: pages.slug,
      author: pages.revisions.length > 0 ? { id: pages.revisions[0].author.id, name: pages.revisions[0].author.name } : { id: pages.author.id, name: pages.author.name },
      createdAt: pages.createdAt,
      updatedAt: pages.updatedAt,
      tags: pages.tags.map(t => {
        return { id: t.tag.id, name: t.tag.name };
      })
     } as Page);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { title, content, authorId, tags } = body;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    await prisma.page.delete({
      where: { slug: slug },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete page" }, { status: 500 });
  }
}