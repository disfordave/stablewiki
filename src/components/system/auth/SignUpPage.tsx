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

import { DisabledMessage, TransitionFormButton } from "@/components/ui";
import { WIKI_DISABLE_SIGNUP } from "@/config";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { getThemeColor, safeRedirect } from "@/utils";

export default async function SignupPage() {
  if (WIKI_DISABLE_SIGNUP) {
    return <DisabledMessage message="Signups are disabled." />;
  }
  async function handleSignup(formData: FormData) {
    "use server";
    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const passwordConfirm = formData.get("passwordConfirm")?.toString() || "";

    if (password !== passwordConfirm) {
      safeRedirect(`/wiki/System:SignUp?error=${"Passwords do not match"}`);
    }
    const consent = formData.get("consent") === "on";

    if (!consent) {
      safeRedirect(
        `/wiki/System:SignUp?error=${"You must agree to the terms and conditions"}`,
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          passwordConfirm,
          consent,
        }),
      },
    );

    if (res.ok) {
      // Redirect to signin page with success message
      safeRedirect(
        `/wiki/System:SignIn?success=${"Account created successfully. Please sign in."}`,
      );
    } else {
      const data = await res.json();
      safeRedirect(
        `/wiki/System:SignUp?error=${
          data.error || "An unexpected error occurred"
        }`,
      );
    }
  }
  //   const params = await searchParams;
  //   const error = params.error as string | undefined;
  return (
    <div>
      <h1 className="mb-4 text-center text-4xl font-bold">Sign Up</h1>
      <form
        action={handleSignup}
        className="mx-auto mt-4 flex max-w-sm flex-col gap-4"
      >
        <div>
          <label htmlFor="username" className="block">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
          />
          <p className="mt-1 text-sm text-gray-500">
            Username must be 3-20 characters long and can only contain letters,
            numbers, and underscores
          </p>
        </div>
        <div>
          <label htmlFor="password" className="block">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className={`w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-gray-900`}
          />
          <p className="mt-1 text-sm text-gray-500">
            Password must be at least 8 characters long
          </p>
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="block">
            Confirm Password:
          </label>
          <input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            required
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
            I agree to the{" "}
            <Link
              href="/wiki/System:Terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              terms and conditions
            </Link>
            .
          </label>
        </div>
        <TransitionFormButton
          useButtonWithoutForm={true}
          className={`${getThemeColor.bg.base} text-white ${getThemeColor.bg.hover} w-full`}
        >
          <UserPlusIcon className="inline size-5" />
          Sign Up
        </TransitionFormButton>
      </form>
      <div className="text-center">
        <Link href="/wiki/System:SignIn" className="mt-4 inline-block">
          Already have an account?{" "}
          <span className="underline hover:no-underline">Sign In</span>
        </Link>
        {/* <p className="text-red-500">{error && <span>{error}</span>}</p> */}
      </div>
    </div>
  );
}
