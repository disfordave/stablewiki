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
import { WIKI_DISABLE_MEDIA, WIKI_MEDIA_ADMIN_ONLY } from "@/config";
import { getUser, signOutUser } from "@/lib";
import { canRestorePages } from "@/server/authz";
import { errorMessage } from "@/server/errors";
import {
  changePassword,
  setPageAccessLevel,
  setUserStatus,
} from "@/server/users";
import { getThemeColor, safeRedirect } from "@/utils";
import {
  PencilSquareIcon,
  PhotoIcon,
  ArrowLeftStartOnRectangleIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Role } from "@/generated/prisma/client";

export default async function DashboardPage() {
  const user = await getUser();

  async function adminAction(formData: FormData) {
    "use server";
    const actionType = formData.get("actionType") as string;
    const consent = formData.get("consent") as string;

    if (consent !== "on") {
      safeRedirect(
        `/wiki/System:Dashboard?error=${"You must confirm to perform this admin action."}`,
      );
    }

    try {
      const admin = await getUser();
      if (actionType === "changeUserStatus") {
        await setUserStatus(
          admin,
          String(formData.get("targetUsername") ?? ""),
          parseInt(formData.get("newStatus") as string, 10),
        );
      } else if (actionType === "changePageAccessLevel") {
        await setPageAccessLevel(
          admin,
          formData.get("targetPageId"),
          parseInt(formData.get("newAccessLevel") as string, 10),
        );
      } else {
        safeRedirect(
          `/wiki/System:Dashboard?error=${"Invalid admin action type."}`,
        );
      }
    } catch (error) {
      safeRedirect(
        `/wiki/System:Dashboard?error=${errorMessage(error, "Failed to perform admin action")}`,
      );
    }

    safeRedirect(
      `/wiki/System:Dashboard?success=${"Admin action completed successfully!"}`,
    );
  }

  async function changePasswordAction(formData: FormData) {
    "use server";
    try {
      await changePassword(await getUser(), {
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        newPasswordConfirm: formData.get("newPasswordConfirm"),
      });
    } catch (error) {
      safeRedirect(
        `/wiki/System:Dashboard?error=${errorMessage(error, "Failed to change password")}`,
      );
    }
    safeRedirect(
      `/wiki/System:Dashboard?success=${"Password changed successfully!"}`,
    );
  }

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
        {user.status > 0 && (
          <p className="mt-2 mb-4 rounded-xl bg-red-100 p-4 text-red-900 dark:bg-red-900/30 dark:text-red-100">
            Your account is currently banned. Please contact support for more
            information.
          </p>
        )}
        <div className="mt-2 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
          {user.role === Role.ADMIN && (
            <>
              <p className={`font-semibold ${getThemeColor.text.base}`}>
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
              <p className="font-semibold text-blue-500">
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
              <p className="font-semibold text-green-500">
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
        <div className="mt-2 mb-2 flex flex-col flex-wrap items-start justify-start gap-2">
          <div>
            <p className="mb-1 font-semibold">User Links</p>
            <div className="flex flex-wrap items-center gap-2">
              <TransitionLinkButton
                href={`/wiki/User:${user.username}`}
                className={`${getThemeColor.bg.base} text-white ${getThemeColor.bg.hover}`}
              >
                <UserIcon className="inline size-5" />
                My Page
              </TransitionLinkButton>
              <TransitionLinkButton
                href={`/wiki/User:${user.username}#posts`}
                className={`text-white ${getThemeColor.bg.hover} ${getThemeColor.bg.base}`}
              >
                <DocumentTextIcon className="inline size-5" />
                My Posts
              </TransitionLinkButton>
              <TransitionLinkButton
                href={`/wiki/System:Revisions?username=${user.username}`}
                className={`${getThemeColor.bg.base} text-white ${getThemeColor.bg.hover}`}
              >
                <ClockIcon className="inline size-5" />
                My Revisions
              </TransitionLinkButton>
              <TransitionLinkButton
                href={`/wiki/System:Comments?username=${user.username}`}
                className={`${getThemeColor.bg.base} text-white ${getThemeColor.bg.hover}`}
              >
                <ChatBubbleBottomCenterTextIcon className="inline size-5" />
                My Comments
              </TransitionLinkButton>
            </div>
          </div>
          <div>
            <p className="mb-1 font-semibold">General Actions</p>
            <div className="flex flex-wrap items-center gap-2">
              <TransitionLinkButton
                href={`/wiki/System:CreatePage`}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                <PencilSquareIcon className="inline size-5" />
                Add New Page
              </TransitionLinkButton>
              {WIKI_DISABLE_MEDIA ? null : WIKI_MEDIA_ADMIN_ONLY &&
                user.role !== Role.ADMIN ? null : (
                <TransitionLinkButton
                  href={`/wiki/System:Upload`}
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  <PhotoIcon className="inline size-5" />
                  Upload Media
                </TransitionLinkButton>
              )}
              {canRestorePages(user) && (
                <TransitionLinkButton
                  href={`/wiki/System:Trash`}
                  className="bg-zinc-500 text-white hover:bg-zinc-600"
                >
                  <TrashIcon className="inline size-5" />
                  Trash
                </TransitionLinkButton>
              )}
              <TransitionFormButton
                action={signOutUser}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                <ArrowLeftStartOnRectangleIcon className="inline size-5" />
                Sign Out
              </TransitionFormButton>
            </div>
          </div>
        </div>
        {user.role === Role.ADMIN && (
          <details>
            <summary className="mt-4 font-semibold select-none">
              Admin Panel
            </summary>
            <form className="mt-2 flex flex-col gap-4" action={adminAction}>
              <div>
                <label htmlFor="actionType" className="mb-2 block font-medium">
                  Action Type
                </label>
                <select
                  id="actionType"
                  name="actionType"
                  className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
                  required
                >
                  <option value="changeUserStatus">Change User Status</option>
                  <option value="changePageAccessLevel">
                    Change Page Edit Level
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="targetUsername"
                  className="mb-2 block font-medium"
                >
                  Target Username
                </label>
                <input
                  id="targetUsername"
                  type="text"
                  name="targetUsername"
                  placeholder="Target Username"
                  className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
                />
              </div>
              <div>
                <label htmlFor="newStatus" className="block">
                  <p className="font-medium">New User Status</p>
                  <p className="mb-0 text-sm text-zinc-500 dark:text-zinc-400">
                    - 0 for active, 1 for banned
                  </p>
                  <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                    - 101 for normal user, 102 for moderators, 103 for editors,
                    109 for admins
                  </p>
                </label>
                <input
                  id="newStatus"
                  type="number"
                  min="0"
                  max="109"
                  name="newStatus"
                  placeholder="New Status"
                  className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
                />
              </div>
              <div>
                <label
                  htmlFor="targetPageId"
                  className="mb-2 block font-medium"
                >
                  Target Page Slug
                </label>
                <input
                  id="targetPageId"
                  type="text"
                  name="targetPageId"
                  placeholder="Target Page Slug"
                  className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
                />
              </div>
              <div>
                <label htmlFor="newAccessLevel" className="block">
                  <p className="font-medium">New Page Edit Level</p>
                  <p className="mb-0 text-sm text-zinc-500 dark:text-zinc-400">
                    - 0 for signed-in users, 2 for accounts older than 14 days,
                    1 or 3-7 for moderators, 8 for editors, 9 for admins only
                  </p>
                  <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                    - 101 for enabled Lounge access, 102 for disabled Lounge
                  </p>
                </label>
                <input
                  id="newAccessLevel"
                  type="text"
                  min="0"
                  max="9"
                  name="newAccessLevel"
                  placeholder="New Page Edit Level"
                  className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  required
                  className={`h-4 w-4 ${getThemeColor.etc.accent}`}
                />
                <label htmlFor="consent" className="select-none">
                  I confirm that I want to perform this admin action.
                </label>
              </div>
              <TransitionFormButton
                useButtonWithoutForm
                className={`text-white ${getThemeColor.bg.base} ${getThemeColor.bg.hover} mb-2`}
              >
                Perform Admin Action
              </TransitionFormButton>
            </form>
          </details>
        )}
        <details>
          <summary className="mt-4 font-semibold select-none">
            Change Password
          </summary>
          <form
            className="mt-2 flex flex-col gap-4"
            action={changePasswordAction}
          >
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block font-medium"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="mb-2 block font-medium">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                placeholder="New Password"
                className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
                required
              />
            </div>
            <div>
              <label
                htmlFor="newPasswordConfirm"
                className="mb-2 block font-medium"
              >
                Confirm New Password
              </label>
              <input
                id="newPasswordConfirm"
                type="password"
                name="newPasswordConfirm"
                placeholder="Confirm New Password"
                className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
                required
              />
            </div>
            <input type="hidden" name="username" value={user.username} />
            <TransitionFormButton
              useButtonWithoutForm
              className={`text-white ${getThemeColor.bg.base} ${getThemeColor.bg.hover} mb-2`}
            >
              Change Password
            </TransitionFormButton>
          </form>
        </details>
        <details>
          <summary className="mt-4 font-semibold select-none">
            Debug Info
          </summary>
          <pre className="mt-2 overflow-auto rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
            {JSON.stringify(
              {
                id: user.id,
                username: user.username,
                avatarUrl: user.avatarUrl,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </>
    );
  }
}
