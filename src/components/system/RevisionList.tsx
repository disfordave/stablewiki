import Link from "next/link";

export default function RevisionList({
  revisions,
  slug,
}: {
  revisions: {
    id: string;
    version: number;
    content: string;
    createdAt: string;
    author: { id: string; username: string };
    summary: string;
  }[];
  slug: string;
}) {
  return (
    <ul className="mt-4 flex flex-col gap-4">
      {revisions.map(
        (rev: {
          id: string;
          version: number;
          content: string;
          createdAt: string;
          author: { id: string; username: string };
          summary: string;
        }) => (
          <li
            key={rev.id}
            className="flex flex-col items-start justify-between gap-1 border-b border-gray-300 pb-2 dark:border-gray-700"
          >
            <Link
              className="hover:underline"
              href={`/wiki/${slug}?action=history&ver=${rev.version}`}
            >
              <h2 className="font-semibold">Revision ver. {rev.version}</h2>
              <p className="border-s-4 border-gray-300 ps-2 dark:border-gray-700">
                {rev.summary || "No summary provided."}
              </p>
              <p className="text-sm text-gray-500">
                Edited by {rev.author.username} on{" "}
                {new Date(rev.createdAt).toLocaleString()}
              </p>
            </Link>
            <div className="flex flex-col">
              <Link
                href={`/wiki/${slug}?action=diff&ver=${rev.version}`}
                className="inline-block text-sm text-blue-500 hover:underline"
              >
                Differences
              </Link>
              <Link
                href={`/wiki/${slug}?action=revert&ver=${rev.version}`}
                className="inline-block text-sm text-red-500 hover:underline"
              >
                Revert to ver. {rev.version}
              </Link>
            </div>
          </li>
        ),
      )}
    </ul>
  );
}
