import { PageWithRelations } from "@/lib/types";

export default async function WikiList() {
  let pagesList: PageWithRelations[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pages`);
    if (!res.ok) throw new Error("Failed to fetch pages");
    const { pages }: { pages: PageWithRelations[] } = await res.json();
    pagesList = pages;
  } catch (err) {
    console.error(err);
    return <p className="text-red-500">Failed to load pages 😢</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-4 mt-4">
        {pagesList.map((page) => (
          <li key={page.id}>
            <a
              href={`/wiki/${page.slug}`}
              className="hover:underline"
            >
              <div className="shadow-sm p-4 rounded-2xl bg-white dark:bg-gray-800">
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
              </div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
