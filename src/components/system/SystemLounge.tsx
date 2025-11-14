import { getThemeColor } from "@/utils";
import { TransitionLinkButton } from "../ui";
import { DocumentTextIcon } from "@heroicons/react/24/solid";

export default function SystemLounge({ slug }: { slug: string[] }) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Lounge</h1>
      <p className="mt-2">{`This is a placeholder for the System Page "Lounge for ${slug.slice(1).length > 0 ? decodeURIComponent(slug.slice(1).join("/")) : "System:Lounge Home"}"`}</p>
      <TransitionLinkButton
        href={`/wiki/${slug.slice(1).join("/")}`}
        className={`${getThemeColor().bg.base} ${getThemeColor().bg.hover} mt-2 text-white`}
      >
        <DocumentTextIcon className="inline size-5" />
        Back to Page
      </TransitionLinkButton>
    </div>
  );
}
