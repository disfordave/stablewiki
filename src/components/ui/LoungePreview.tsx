import Link from "next/link";

export function LoungePreview({
  pageTitle,
  slug,
}: {
  pageTitle: string;
  slug: string;
}) {
  return (
    <div className="mt-4 flex flex-col gap-2 overflow-auto rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
      <Link href={`/wiki/System:Lounge/${slug}`}>
        <div className="flex w-full flex-wrap items-center justify-between gap-2 no-underline hover:underline">
          <div>
            <h2 className="text-lg font-semibold">Wiki Lounge</h2>
            <p className="text-sm text-gray-500">
              Join the conversation about the &apos;{pageTitle}&apos; article →
            </p>
          </div>
          {/* <div
            className={`${getThemeColor().bg.base} ${getThemeColor().bg.groupHover} flex aspect-square w-full max-w-fit cursor-pointer items-center justify-between rounded-full p-2 text-white transition-colors duration-300`}
          >
            <ArrowRightIcon className="inline size-5" />
          </div> */}
        </div>
      </Link>
      <ul className="flex flex-col gap-2">
        <li>
          <Link href={`/wiki/System:Lounge/${slug}`}>
            <div className="rounded-lg bg-white p-4 hover:underline dark:bg-gray-800">
              <p className="font-medium">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
              </p>
              <p className="text-sm text-gray-500">By someuser on 2024-06-15</p>
            </div>
          </Link>
        </li>
        <li>
          <Link href={`/wiki/System:Lounge/${slug}`}>
            <div className="rounded-lg bg-white p-4 hover:underline dark:bg-gray-800">
              <p className="font-medium">
                Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua?
              </p>
              <p className="text-sm text-gray-500">By oneuser on 2024-06-15</p>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
}
