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

import { TransitionFormButton } from "@/components/ui";
import { WIKI_DISABLE_SIGNUP } from "@/config";
import { getUser } from "@/lib";
import {
  SignInResult,
  sessionCookieOptions,
  signInWithPassword,
} from "@/server/auth/credentials";
import { SESSION_COOKIE } from "@/server/auth/session";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/solid";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { getThemeColor, safeRedirect } from "@/utils";
import { RATE_LIMITS, checkRateLimit, getClientIp } from "@/server/rateLimit";

export default async function SignIn() {
  const user = await getUser();
  if (user) {
    safeRedirect(`/wiki/System:Dashboard`);
  }

  async function signIn(formData: FormData) {
    "use server";

    if (user) {
      safeRedirect(`/wiki/System:Dashboard`);
    }

    // Limit by the visitor's address; a fetch to our own API would only see the server's
    if (
      !checkRateLimit(
        `signin:${getClientIp(await headers())}`,
        RATE_LIMITS.signIn,
      )
    ) {
      safeRedirect(
        `/wiki/System:SignIn?error=${"Too many sign-in attempts. Please try again later."}`,
      );
    }

    let result: SignInResult;
    try {
      result = await signInWithPassword(
        formData.get("username"),
        formData.get("password"),
      );
    } catch (error) {
      console.error(error);
      result = {
        ok: false,
        status: 500,
        error: "An unexpected error occurred",
      };
    }

    if (!result.ok) {
      safeRedirect(`/wiki/System:SignIn?error=${result.error}`);
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE,
      value: result.token,
      ...sessionCookieOptions(),
    });

    safeRedirect(`/wiki/System:Dashboard`);
  }

  return (
    <div>
      <h1 className="mb-4 text-center text-4xl font-bold">Sign In</h1>
      <form
        action={signIn}
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
        </div>
        <TransitionFormButton
          useButtonWithoutForm={true}
          className={`${getThemeColor.bg.base} text-white ${getThemeColor.bg.hover} w-full`}
        >
          <ArrowLeftEndOnRectangleIcon className="inline size-5" />
          Sign In
        </TransitionFormButton>
      </form>
      <div className="text-center">
        {WIKI_DISABLE_SIGNUP ? (
          <p className="mt-4 inline-block max-w-md">
            Signups are currently disabled. If you need an account, please
            contact the wiki administrator.
          </p>
        ) : (
          <Link href="/wiki/System:SignUp" className="mt-4 inline-block">
            Don&apos;t have an account?{" "}
            <span className="underline hover:no-underline">Sign Up</span>
          </Link>
        )}
        {/* <p className="text-green-500">{success && <span>{success}</span>}</p>
        <p className="text-red-500">{error && <span>{error}</span>}</p> */}
      </div>
    </div>
  );
}
