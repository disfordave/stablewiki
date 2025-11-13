/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
  MustSignInMessage,
  TransitionFormButton,
  TransitionLinkButton,
} from "@/components/ui";
import { WIKI_DISABLE_MEDIA, WIKI_HOMEPAGE_LINK } from "@/config";
import { getUser, signOutUser } from "@/lib";
import {
  HomeIcon,
  PhotoIcon,
  ArrowLeftStartOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Role } from "@prisma/client";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    return (
      <>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <MustSignInMessage />
      </>
    );
  } else {
    return (
      <>
        <h1 className="text-2xl font-bold">{user.username}&apos;s Dashboard</h1>
        <p className="font-semibold">Hi, {user.username}!</p>
        <p>
          You&apos;ve been a member since{" "}
          <span className="font-semibold">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </p>

        <div className="mt-2 rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
          {user.role === Role.ADMIN && (
            <>
              <p className="font-bold text-violet-500">
                You have administrative privileges.
              </p>
              <ul className="list-inside list-disc">
                <li>You can create and edit pages.</li>
                <li>
                  You can comment on pages and participate in discussions.
                </li>
                <li>You can review and approve changes made by other users.</li>
                <li>You can manage users, pages, and site settings.</li>
                <li>
                  You can access the admin panel for advanced configurations.
                </li>
              </ul>
            </>
          )}
          {user.role === Role.EDITOR && (
            <>
              <p className="font-bold text-blue-500">
                You have editor privileges.
              </p>
              <ul className="list-inside list-disc">
                <li>You can create and edit pages.</li>
                <li>
                  You can comment on pages and participate in discussions.
                </li>
                <li>You can review and approve changes made by other users.</li>
              </ul>
            </>
          )}
          {user.role === Role.USER && (
            <>
              <p className="font-bold text-green-500">
                You have standard user privileges.
              </p>
              <ul className="list-inside list-disc">
                <li>You can create and edit pages.</li>
                <li>
                  You can comment on pages and participate in discussions.
                </li>
              </ul>
            </>
          )}
        </div>
        <details>
          <summary className="mt-4 mb-2 font-bold select-none">
            Debug Info
          </summary>
          <pre className="overflow-auto rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TransitionLinkButton
              href={WIKI_HOMEPAGE_LINK}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <HomeIcon className="inline size-5" />
              Go to Home
            </TransitionLinkButton>
            <TransitionLinkButton
              href={`/wiki/User:${user.username}`}
              className="bg-violet-500 text-white hover:bg-violet-600"
            >
              <UserIcon className="inline size-5" />
              User Page
            </TransitionLinkButton>
            {WIKI_DISABLE_MEDIA ? null : (
              <TransitionLinkButton
                href="/wiki/System:Upload"
                className="bg-green-500 text-white hover:bg-green-600"
              >
                <PhotoIcon className="inline size-5" />
                Upload
              </TransitionLinkButton>
            )}
          </div>
          <TransitionFormButton
            action={signOutUser}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            <ArrowLeftStartOnRectangleIcon className="inline size-5" />
            Sign Out
          </TransitionFormButton>
        </div>
      </>
    );
  }
}
