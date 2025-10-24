import Markdown from "react-markdown";

function WikiMarkdown({ content }: { content: string }) {
  const processed = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (match, p1) => `[${p1}](/wiki/${encodeURIComponent(p1.trim())})`,
  );

  return <Markdown>{processed}</Markdown>;
}

export default function StableMarkdown({
    content,
    }: {
    content: string;
    }) {
    return (
        <div className="prose dark:prose-invert prose-hr:mt-8 prose-hr:mb-8 my-8 max-w-none">
        <WikiMarkdown content={content} />
      </div>
    );
}