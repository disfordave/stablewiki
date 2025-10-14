export default async function WikiHistoryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const data = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}/history`
    ).then(res => res.json()).then(data => data.page || []);

    const revisions = data.revisions || [];

    if (revisions.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold">History for: {decodeURIComponent(slug)}</h1>
                <p>No data found for this page.</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">History for: {decodeURIComponent(slug)}</h1>
            <ul className="flex flex-col gap-4 mt-4">
                {revisions.map((rev: {
                    id: string;
                    version: number;
                    content: string;
                    createdAt: string;
                    author: { id: string; username: string };
                    summary: string;
                }) => (
                    <li key={rev.id} className="rounded">
                        <h2 className="text-xl font-semibold">Revision ID: {rev.version}</h2>
                        <p className="text-sm text-gray-500">
                            By {rev.author.username} on {new Date(rev.createdAt).toLocaleString()}
                        </p>
                        <p>
                            Summary: {rev.summary || "No summary provided."}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}