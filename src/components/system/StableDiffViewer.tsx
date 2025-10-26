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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold">
            Old Content{" "}
            {oldVer && <span className="text-gray-500">(ver. {oldVer})</span>}
          </h3>
          <pre className="max-h-96 overflow-auto rounded-xl bg-gray-100 p-4 whitespace-pre-wrap dark:bg-gray-900">
            {oldContent ? oldContent : "No previous content available."}
          </pre>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">
            New Content{" "}
            {newVer && <span className="text-gray-500">(ver. {newVer})</span>}
          </h3>
          <pre className="max-h-96 overflow-auto rounded-xl bg-gray-100 p-4 whitespace-pre-wrap dark:bg-gray-900">
            {newContent ? newContent : "No new content available."}
          </pre>
        </div>
      </div>
    </div>
  );
}
