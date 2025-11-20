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
import { WIKI_DISABLE_MEDIA } from "@/config";
import { getUser, signOutUser } from "@/lib";
import { getThemeColor, safeRedirect } from "@/utils";
import {
  PencilSquareIcon,
  PhotoIcon,
  ArrowLeftStartOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Role } from "@prisma/client";

export default async function DashboardPage() {
  const user = await getUser();

  async function adminAction(formData: FormData) {
    "use server";
    const actionType = formData.get("actionType") as string;
    const targetUsername = formData.get("targetUsername") as string;
    const newStatus = parseInt(formData.get("newStatus") as string, 10);
    const consent = formData.get("consent") as string;

    if (consent !== "on") {
      safeRedirect(
        `/wiki/System:Dashboard?error=${"You must confirm to perform this admin action."}`,
      );
    }

    if (!user || user.role !== Role.ADMIN) {
      safeRedirect(
        `/wiki/System:Dashboard?error=${"You must be an admin to perform this action."}`,
      );
    }

    if (actionType === "changeUserStatus") {
      if (!targetUsername) {
        safeRedirect(
          `/wiki/System:Dashboard?error=${"Target username is required."}`,
        );
      }

      if (isNaN(newStatus)) {
        safeRedirect(
          `/wiki/System:Dashboard?error=${"New status must be a valid number."}`,
        );
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/${targetUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      if (!response.ok) {
        safeRedirect(
          `/wiki/System:Dashboard?error=${"Failed to perform admin action"}`,
        );
      }

      if (response.ok) {
        safeRedirect(
          `/wiki/System:Dashboard?success=${"Admin action completed successfully!"}`,
        );
      }
    } else if (actionType === "changePageAccessLevel") {
      const targetPageId = formData.get("targetPageId") as string;
      const newAccessLevel = parseInt(
        formData.get("newAccessLevel") as string,
        10,
      );

      if (!targetPageId) {
        safeRedirect(
          `/wiki/System:Dashboard?error=${"Target page ID is required."}`,
        );
      }

      if (!newAccessLevel) {
        safeRedirect(
          `/wiki/System:Dashboard?error=${"New access level is required."}`,
        );
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/pages/${targetPageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            accessLevel: newAccessLevel,
          }),
        },
      );

      if (!response.ok) {
        safeRedirect(
          `/wiki/System:Dashboard?error=${"Failed to perform admin action"}`,
        );
      }

      if (response.ok) {
        safeRedirect(
          `/wiki/System:Dashboard?success=${"Admin action completed successfully!"}`,
        );
      }
    } else {
      safeRedirect(
        `/wiki/System:Dashboard?error=${"Invalid admin action type."}`,
      );
    }
  }

  async function changePassword(formData: FormData) {
    "use server";
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const newPasswordConfirm = formData.get("newPasswordConfirm") as string;
    // const username = formData.get("username") as string;

    if (!user) {
      safeRedirect(
        `/wiki/System:SignIn?error=${"You must be signed in to change your password."}`,
      );
    }

    if (newPassword !== newPasswordConfirm) {
      safeRedirect(
        `/wiki/System:Dashboard?error=${"New passwords do not match"}`,
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          username: user.username,
          currentPassword,
          newPassword,
          newPasswordConfirm,
        }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      safeRedirect(
        `/wiki/System:Dashboard?error=${data.error || "Failed to change password"}`,
      );
    }

    if (response.ok) {
      console.log("Password changed successfully");
      safeRedirect(
        `/wiki/System:Dashboard?success=${"Password changed successfully!"}`,
      );
    }
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
        <div className="mt-2 rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
          {user.role === Role.ADMIN && (
            <>
              <p className={`font-bold ${getThemeColor.text.base}`}>
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
        {user.role === Role.ADMIN && (
          <details>
            <summary className="mt-4 mb-2 font-bold select-none">
              Admin Panel
            </summary>
            <form className="flex flex-col gap-4" action={adminAction}>
              <div>
                <label htmlFor="actionType" className="mb-2 block font-medium">
                  Action Type
                </label>
                <select
                  id="actionType"
                  name="actionType"
                  className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
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
                  className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
                />
              </div>
              <div>
                <label htmlFor="newStatus" className="block">
                  <p className="font-medium">New User Status</p>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    (e.g., 0 for active, 1 for banned)
                  </p>
                </label>
                <input
                  id="newStatus"
                  type="number"
                  min="0"
                  max="1"
                  name="newStatus"
                  placeholder="New Status"
                  className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
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
                  className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
                />
              </div>
              <div>
                <label htmlFor="newAccessLevel" className="block">
                  <p className="font-medium">New Access (Edit) Level</p>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    (e.g., 0 for registered users, 1 for moderators, 9 for
                    admins only)
                  </p>
                </label>
                <input
                  id="newAccessLevel"
                  type="text"
                  min="0"
                  max="9"
                  name="newAccessLevel"
                  placeholder="New Access (Edit) Level"
                  className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
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
                className={`text-white ${getThemeColor.bg.base} ${getThemeColor.bg.hover}`}
              >
                Perform Admin Action
              </TransitionFormButton>
            </form>
          </details>
        )}
        <details>
          <summary className="mt-4 mb-2 font-bold select-none">
            Change Password
          </summary>
          <form className="flex flex-col gap-4" action={changePassword}>
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
                className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
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
                className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
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
                className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
                required
              />
            </div>
            <input type="hidden" name="username" value={user.username} />
            <TransitionFormButton
              useButtonWithoutForm
              className={`text-white ${getThemeColor.bg.base} ${getThemeColor.bg.hover}`}
            >
              Change Password
            </TransitionFormButton>
          </form>
        </details>
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
              href={`/wiki/User:${user.username}`}
              className={`${getThemeColor.bg.base} text-white ${getThemeColor.bg.hover}`}
            >
              <UserIcon className="inline size-5" />
              User Page
            </TransitionLinkButton>
            <TransitionLinkButton
              href={`/wiki/System:CreatePage`}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <PencilSquareIcon className="inline size-5" />
              Add New Page
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
            <TransitionFormButton
              action={signOutUser}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              <ArrowLeftStartOnRectangleIcon className="inline size-5" />
              Sign Out
            </TransitionFormButton>
          </div>
        </div>
      </>
    );
  }
}
