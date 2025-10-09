import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const pages = await prisma.page.findUnique({
      where: { slug: slug },
      include: { author: true, tags: { include: { tag: true } } },
    });

    if (!pages) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }
    return Response.json({ pages });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}
