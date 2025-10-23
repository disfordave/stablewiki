import { getUser } from "@/lib/auth/functions";
import { WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/config";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { TransitionLinkButton, TransitionFormButton } from "@/components/ui";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/solid";

export default async function Header() {
  const user = await getUser();

  async function search(formData: FormData) {
    "use server";
    const query = formData.get("search")?.toString() || "";
    // Go to search page
    redirect(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="rounded-b-2xl bg-white p-4 sm:rounded-2xl dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xl font-bold">
          <Link href={WIKI_HOMEPAGE_LINK} className="flex items-center gap-1">
            <Image
              src="/icon.svg"
              alt={`Logo of ${WIKI_NAME}`}
              width={24}
              height={24}
            />
            <span className="transition-colors duration-300 hover:text-violet-500">
              {WIKI_NAME}
            </span>
          </Link>
        </p>
        {user.username ? (
          <div className="flex items-center gap-2">
            <TransitionLinkButton
              href="/app/dashboard"
              className="bg-violet-500 text-white hover:bg-violet-600"
            >
              <UserCircleIcon className="inline size-5" />
              <span className="font-bold">{user.username}</span>
            </TransitionLinkButton>
          </div>
        ) : (
          <TransitionLinkButton
            href="/app/signin"
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            <ArrowLeftEndOnRectangleIcon className="inline size-5" />
            Sign In
          </TransitionLinkButton>
        )}
      </div>
      <form action={search} className="relative mt-2 flex w-full gap-2">
        <input
          type="text"
          name="search"
          className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
          placeholder="Search..."
          required
        />
        <TransitionFormButton
          title="Search"
          useButtonWithoutForm={true}
          className="absolute end-0 h-full rounded-full bg-violet-500 text-white hover:bg-violet-600"
        >
          <MagnifyingGlassIcon className="inline size-4" />
        </TransitionFormButton>
      </form>
    </header>
  );
}
