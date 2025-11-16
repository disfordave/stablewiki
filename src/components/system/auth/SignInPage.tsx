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
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/solid";
import { cookies } from "next/headers";
import Link from "next/link";
import { getThemeColor, safeRedirect } from "@/utils";

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

    //Extracting form data

    const rawFormData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rawFormData),
      },
    );

    if (res.ok) {
      const data = await res.json();

      const cookieStore = await cookies();
      cookieStore.set({
        name: "jwt",
        value: data.user.token,
        httpOnly: true,
        sameSite: "lax",
      });

      safeRedirect(`/wiki/System:Dashboard`);
    } else {
      const data = await res.json();
      safeRedirect(
        `/wiki/System:SignIn?error=${
          data.error || "An unexpected error occurred"
        }`,
      );
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-center text-4xl font-bold">Sign In</h1>
      <form
        action={signIn}
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
