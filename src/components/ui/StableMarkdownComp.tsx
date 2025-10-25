import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function WikiMarkdown({ content }: { content: string }) {
  let processed = content;

  // ---- 1. Media embeds ----
  processed = processed.replace(/!\[\[([^[\]]+)\]\]/g, (_, fileName) => {
    const clean = fileName.trim();
    const encoded = encodeURIComponent(clean);
    return `![${clean}](/media/${encoded})`;
  });

  // ---- 2. Wiki links ----
  processed = processed.replace(
    /\[\[([^[\]|]+?)(?:\s*\|\|\s*([^[\]]+))?\]\]/g,
    (_, page, label) => {
      const pageName = page.trim();
      const linkLabel = label ? label.trim() : pageName;
      const slug = encodeURIComponent(pageName);

      // Normalize: always display as [[Page||Label]]
      // const normalized =
      //   label && label.trim() !== pageName
      //     ? `[[${pageName}||${linkLabel}]]`
      //     : `[[${pageName}]]`;

      // You can store `normalized` if you want to rewrite the file consistently
      return `[${linkLabel}](/wiki/${slug})`;
    },
  );

  return <Markdown remarkPlugins={[remarkGfm]}>{processed}</Markdown>;
}

export default function StableMarkdownComp({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert prose-hr:mt-8 prose-hr:mb-8 prose-img:rounded-xl prose-blue prose-a:no-underline prose-a:hover:underline my-8 max-w-none">
      <WikiMarkdown content={content} />
    </div>
  );
}
