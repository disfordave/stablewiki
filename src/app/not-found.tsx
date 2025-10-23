import { TransitionLinkButton } from "@/components/ui";
import { WIKI_HOMEPAGE_LINK } from "@/config";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">
        404
      </h1>
      <p className="my-4 text-xl text-gray-600 dark:text-gray-400">
        Oops! The page you are looking for does not exist.
      </p>
      <TransitionLinkButton
        href={WIKI_HOMEPAGE_LINK}
        className="bg-violet-500 text-white hover:bg-violet-600"
      >
        Go to Homepage
      </TransitionLinkButton>
    </div>
  );
}
