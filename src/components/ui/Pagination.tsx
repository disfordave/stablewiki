import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { TransitionLinkButton } from "./buttons/TransitionButton";

export default function Pagination({
  currentPage,
  totalPages,
  slug,
}: {
  currentPage: number;
  totalPages: number;
  slug: string;
}) {
  return (
    <>
      <div className="mt-4 flex items-center justify-center gap-2">
        <TransitionLinkButton
          href={`/wiki/${slug}${currentPage - 1}`}
          className={`w-fit bg-gray-500 text-white hover:bg-gray-600 ${currentPage <= 1 && "invisible"}`}
          title="Previous Page"
        >
          <ChevronLeftIcon className="inline size-5" />
        </TransitionLinkButton>
        <p className="tabular-nums">{currentPage + " / " + totalPages}</p>
        <TransitionLinkButton
          href={`/wiki/${slug}${currentPage + 1}`}
          className={`w-fit bg-gray-500 text-white hover:bg-gray-600 ${currentPage >= totalPages && "invisible"}`}
          title="Next Page"
        >
          <ChevronRightIcon className="inline size-5" />
        </TransitionLinkButton>
      </div>
    </>
  );
}
