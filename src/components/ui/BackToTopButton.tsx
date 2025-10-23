import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { TransitionLinkButton } from "./TransitionButton";

export function BackToTopButton() {
  return (
    <TransitionLinkButton
      href="#top"
      className="fixed end-6 bottom-6 aspect-square size-12 bg-gray-300/50 hover:bg-gray-400/50 dark:bg-gray-700/50 dark:hover:bg-gray-600/50"
      title="Back to Top"
    >
      <ArrowUpIcon className="inline size-5" />
    </TransitionLinkButton>
  );
}
