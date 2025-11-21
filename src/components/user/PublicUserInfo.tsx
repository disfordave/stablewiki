import { PublicUser } from "@/types";
import { TransitionLinkButton } from "../ui";
import {
  DocumentTextIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";
import { getThemeColor } from "@/utils";
import Link from "next/link";

export default async function PublicUserInfo({
  username,
}: {
  username: string;
}) {
  async function fetchUserData(username: string): Promise<PublicUser | null> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user/${username}`,
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data as PublicUser;
  }

  const user = await fetchUserData(username);

  if (!user) {
    return <p>Failed to load user information.</p>;
  }

  return (
    <div className="mt-3 flex items-center rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
      <div>
        <h2 className="text-xl font-semibold">
          <Link
            href={`/wiki/User:${user.username}`}
            className="hover:underline"
          >
            {user.username}
          </Link>
        </h2>
        <p className="text-sm text-gray-500">Role: {user.role}</p>
        <p className="text-sm text-gray-500">
          Status: {user.status === 0 ? "Active" : "Banned"}
        </p>
        <p className="text-sm text-gray-500">
          Joined on {new Date(user.createdAt).toLocaleDateString()}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-start gap-2">
          <TransitionLinkButton
            href={`/wiki/User:${user.username}#posts`}
            className={`text-white ${getThemeColor.bg.hover} ${getThemeColor.bg.base}`}
          >
            <DocumentTextIcon className="inline size-5" />
            Posts
          </TransitionLinkButton>
          <TransitionLinkButton
            href={`/wiki/System:Revisions?username=${user.username}`}
            className={`${getThemeColor.bg.base} text-white ${getThemeColor.bg.hover}`}
          >
            <ClockIcon className="inline size-5" />
            Revisions
          </TransitionLinkButton>
          <TransitionLinkButton
            href={`/wiki/System:Comments?username=${user.username}`}
            className={`${getThemeColor.bg.base} ${getThemeColor.bg.hover} text-white`}
          >
            <ChatBubbleBottomCenterTextIcon className="inline size-5" />
            Comments
          </TransitionLinkButton>
        </div>
      </div>
    </div>
  );
}
