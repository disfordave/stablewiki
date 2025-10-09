import { prisma } from "@/lib/prisma";
import { Page } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const page = await prisma.page.findUnique({
      where: { slug: slug },
      include: { author: true, tags: { include: { tag: true } }, revisions: {
          orderBy: { createdAt: "desc" },
          take: 1, 
          include: { author: true },
        }, },
    });

    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }
    return Response.json({ 
      id: page.id,
      title: page.title,
      content: page.revisions.length > 0 ? page.revisions[0].content : page.content,
      slug: page.slug,
      author: page.revisions.length > 0 ? { id: page.revisions[0].author.id, name: page.revisions[0].author.name } : { id: page.author.id, name: page.author.name },
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      tags: page.tags.map(t => {
        return { id: t.tag.id, name: t.tag.name };
      })
     } as Page);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

// export async function POST(
//   request: Request,
//   { params }: { params: Promise<{ slug: string }> }
// ) {
//   const { slug } = await params;
//   const body = await request.json();
//   const { title, content, authorId, tags } = body;
// }

// export async function DELETE(
//   request: Request,
//   { params }: { params: Promise<{ slug: string }> }
// ) {
//   const { slug } = await params;

//   try {
//     await prisma.page.delete({
//       where: { slug: slug },
//     });
//     return new Response(null, { status: 204 });
//   } catch (error) {
//     console.error(error);
//     return Response.json({ error: "Failed to delete page" }, { status: 500 });
//   }
// }