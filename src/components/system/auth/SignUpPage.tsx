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
import { SignUpResult, registerUser } from "@/server/auth/registration";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { headers } from "next/headers";
import Link from "next/link";
import { getThemeColor, safeRedirect } from "@/utils";
import { RATE_LIMITS, checkRateLimit, getClientIp } from "@/server/rateLimit";

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

    if (
      !checkRateLimit(
        `signup:${getClientIp(await headers())}`,
        RATE_LIMITS.signUp,
      )
    ) {
      safeRedirect(
        `/wiki/System:SignUp?error=${"Too many sign-up attempts. Please try again later."}`,
      );
    }

    let result: SignUpResult;
    try {
      result = await registerUser({
        username,
        password,
        passwordConfirm,
        consent,
      });
    } catch (error) {
      console.error(error);
      safeRedirect(
        `/wiki/System:SignUp?error=${"An unexpected error occurred"}`,
      );
    }

    if (result.ok) {
      // Redirect to signin page with success message
      safeRedirect(
        `/wiki/System:SignIn?success=${"Account created successfully. Please sign in."}`,
      );
    } else {
      safeRedirect(`/wiki/System:SignUp?error=${result.error}`);
    }
  }
  //   const params = await searchParams;
  //   const error = params.error as string | undefined;
  return (
    <div>
      <h1 className="mb-4 text-center text-4xl font-bold">Sign Up</h1>
      <form
        action={handleSignup}
        className="mx-auto mt-4 flex max-w-md flex-col gap-4"
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
            className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
          />
          <p className="mt-1 text-sm text-zinc-500">
            Username must be 3-20 characters long and can only contain letters,
            numbers, and underscores. You cannot change your username later.
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
            className={`w-full rounded-full bg-zinc-100 px-4 py-1 focus:ring-2 ${getThemeColor.etc.focusRing} focus:outline-none dark:bg-zinc-900`}
          />
          <p className="mt-1 text-sm text-zinc-500">
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
            I agree to the{" "}
            <Link
              href="/wiki/Wiki:Terms_and_Conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              terms and conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/wiki/Wiki:Privacy_Policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              privacy policy
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
        <p className="animate-pulse text-center text-sm text-zinc-500">
          Currently, you cannot recover your password if you forget it. Please
          make sure to remember your password.
        </p>
      </form>
      <div className="text-center">
        <Link href="/wiki/System:SignIn" className="mt-3 inline-block">
          Already have an account?{" "}
          <span className="underline hover:no-underline">Sign In</span>
        </Link>
        {/* <p className="text-red-500">{error && <span>{error}</span>}</p> */}
      </div>
    </div>
  );
}
