import { getThemeColor } from "@/utils";
import { TransitionLinkButton } from "../ui";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { Page } from "@/types";

function BackToPageButton({ page }: { page: Page }) {
  return (
    <TransitionLinkButton
      href={`/wiki/${page.slug}`}
      className={`${getThemeColor().bg.base} ${getThemeColor().bg.hover} mt-2 text-white`}
    >
      <DocumentTextIcon className="inline size-5" />
      Back to Page
    </TransitionLinkButton>
  );
}

export default function SystemLounge({ page }: { page: Page }) {
  return (
    <div>
      <BackToPageButton page={page} />
      <p className="mt-2">{`This is a placeholder for the System Page "Lounge for ${page.title}"`}</p>
      <BackToPageButton page={page} />
    </div>
  );
}
