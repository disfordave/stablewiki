import { prisma } from "@/lib/prisma";

export default async function WikiList() {
  const pages = await prisma.page.findMany({
    include: {
      author: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <ul className="flex flex-col gap-4 mt-4">
        {pages.map((page) => (
          <li key={page.id} className="shadow-sm p-4 rounded-2xl">
            <h2 className="text-2xl font-bold">{page.title}</h2>
            <p className="text-sm text-gray-500">
              By {page.author.name} on{" "}
              {new Date(page.createdAt).toLocaleDateString()}
            </p>
            <p>{page.content}</p>
            <div className="mt-2">
              {page.tags.map((pt) => (
                <span
                  key={pt.tag.id}
                  className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded mr-1"
                >
                  {pt.tag.name}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
