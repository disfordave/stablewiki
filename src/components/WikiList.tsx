import { Page } from "@/lib/types";

export default async function WikiList({
  pages
}: {
  pages: Page[] | undefined;
}) {
  let pagesList: Page[] = [];
  if (pages) {
    pagesList = pages;
  }

  if (pagesList.length === 0) {
    return <p className="mt-4">No pages found.</p>;
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
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold">{page.title}</h2>
                <p className="text-sm text-gray-500">
                  By {page.author.username} on{" "}
                  {new Date(page.createdAt).toLocaleDateString()}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
