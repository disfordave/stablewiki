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
          <li key={rev.id} className="rounded hover:underline">
            <Link href={`/wiki/${slug}?action=history&ver=${rev.version}`}>
              <h2 className="text-lg font-semibold">
                Revision ID: {rev.version}
              </h2>
              <p className="border-s-4 border-gray-300 ps-2 dark:border-gray-700">
                {rev.summary || "No summary provided."}
              </p>
              <p className="text-sm text-gray-500">
                Edited by {rev.author.username} on{" "}
                {new Date(rev.createdAt).toLocaleString()}
              </p>
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}
