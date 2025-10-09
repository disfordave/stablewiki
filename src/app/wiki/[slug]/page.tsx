import { Page } from "@/lib/types";

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let page: Page | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}`
    );
    if (!res.ok) throw new Error("Failed to fetch page");

    page = await res.json();
  } catch (err) {
    console.error(err);
    return <p className="text-red-500">Failed to load page 😢</p>;
  }

  if (!page) {
    return <p className="text-red-500">Page not found 😢</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{page.title}</h1>
      {/* <p className="text-sm text-gray-500">
        By {page.author.name} on {new Date(page.createdAt).toLocaleDateString()}
      </p> */}
      <div className="mt-2">
        {page.tags.map((pt) => (
          <span
            key={pt.id}
            className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded mr-1"
          >
            {pt.name}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <p>{page.content}</p>
      </div>
    </div>
  );
}
