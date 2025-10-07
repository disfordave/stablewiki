import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      include: { author: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ pages });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}
