export function WikiEditor({ defaultValue }: { defaultValue?: string }) {
  return (
    <>
      <textarea
        name="content"
        defaultValue={defaultValue}
        placeholder="Page content in Markdown"
        className="h-[60vh] w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700"
        required
      ></textarea>
      <input
        type="text"
        name="summary"
        placeholder="Edit summary (optional)"
        className="mt-2 w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700"
      />
    </>
  );
}
