import { Page } from "@/types";
import { slugify } from "@/utils";
import { ClockIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export async function AsideRevisions() {
  async function fetchRevisions() {
    "use server";
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages?sortBy=updatedAt&hPage=1`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch revisions");
      return [];
    }

    const data = await response.json();
    return data || [];
  }

  const revisionsData = await fetchRevisions();

  return (
    <section className="rounded-2xl bg-white p-4 dark:bg-zinc-800">
      <div className="font-bold">
        <ClockIcon className="me-1 mb-[2px] inline size-5" />
        <span className="text-lg">Latest Updates</span>
      </div>
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
        {(revisionsData.pages as Page[]).slice(0, 5).map((rev) => (
          <li key={rev.id}>
            <Link
              href={`/wiki/${slugify(rev.title)}${rev.isRedirect ? "?preventRedirect=true" : ""}`}
              className="hover:underline"
            >
              <div className="flex flex-col text-sm">
                <p className="me-2 line-clamp-1 font-semibold">
                  {rev.title}
                  <span className="text-zinc-500">
                    {rev.isRedirect ? " (Redirect)" : ""}
                  </span>
                </p>
                <p className="line-clamp-1 text-xs text-zinc-500">
                  Last edited on{" "}
                  <span className="font-medium">
                    {new Date(rev.updatedAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZoneName: "short",
                      timeZone: "UTC",
                    })}
                  </span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/wiki/System:Revisions"
        className="mt-2 block text-sm hover:underline"
      >
        View all revisions →
      </Link>
    </section>
  );
}
