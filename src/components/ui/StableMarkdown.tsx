import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function WikiMarkdown({ content }: { content: string }) {
  // Replace [[Page]] and [[Page || Label]] with proper Markdown links
  const processed = content.replace(
    /\[\[([^[\]|]+)(?:\s*\|\|\s*([^[\]]+))?\]\]/g,
    (match, page, label) => {
      const pageName = page.trim();
      const linkLabel = label ? label.trim() : pageName;
      const slug = encodeURIComponent(pageName);
      return `[${linkLabel}](/wiki/${slug})`;
    }
  );

  return <Markdown remarkPlugins={[remarkGfm]}>{processed}</Markdown>;
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