export default function StableDiffViewer({
    oldContent,
    newContent,
    oldVer,
    newVer,
}: {
    oldContent?: string;
    newContent?: string;
    oldVer?: number;
    newVer?: number;
}) {
    // Placeholder for the actual diff viewer implementation
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold mb-2">Old Content {oldVer && <span className="text-gray-500">(ver. {oldVer})</span>}</h3>
                    <pre className="max-h-96 whitespace-pre-wrap bg-gray-100 p-4 rounded-xl dark:bg-gray-900 overflow-auto">
                        {oldContent ? oldContent : "No previous content available."}
                    </pre>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">New Content {newVer && <span className="text-gray-500">(ver. {newVer})</span>}</h3>
                    <pre className="max-h-96 whitespace-pre-wrap bg-gray-100 p-4 rounded-xl dark:bg-gray-900 overflow-auto">
                        {newContent ? newContent : "No new content available."}
                    </pre>
                </div>
            </div>
        </div>
    );
}