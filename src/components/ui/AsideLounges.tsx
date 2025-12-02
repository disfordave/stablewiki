/* eslint-disable @typescript-eslint/no-explicit-any */
import { slugify } from "@/utils";
import Link from "next/link";

export async function AsideLounges() {
  async function fetchComments() {
    // Placeholder for fetching comments logic
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge?action=comments&onlyRoot=true&hPage=1&noDeletedLounges=true`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch comments");
      return [];
    }
  }
  const comments = await fetchComments();

  return (
    <section className="rounded-2xl bg-white p-4 dark:bg-zinc-800">
      <p className="text-lg font-bold">Latest on Lounge</p>
      <p className="text-xs text-zinc-500">
        on{" "}
        {new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
          timeZone: "UTC",
        })}
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {comments.data.slice(0, 5).map((c: any) => (
          <li key={c.id}>
            <Link
              href={`/wiki/${slugify(c.page.title)}/_lounge/${c.id}`}
              className="hover:underline"
            >
              <div className="flex flex-col text-sm">
                {
                  <>
                    <p className="me-2 line-clamp-1 font-semibold">{c.title}</p>
                    <p className="line-clamp-1 text-sm text-zinc-500">
                      from <span className="font-medium">{c.page.title}</span>{" "}
                      by{" "}
                      <span className="font-medium">
                        {c.author?.username || "Unknown"}
                      </span>
                    </p>
                  </>
                }
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/wiki/System:Comments"
        className="mt-2 block text-sm hover:underline"
      >
        View all comments →
      </Link>
    </section>
  );
}
