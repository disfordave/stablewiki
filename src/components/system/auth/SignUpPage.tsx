/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { DisabledMessage, TransitionFormButton } from "@/components/ui";
import { WIKI_DISABLE_SIGNUP } from "@/config";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  if (WIKI_DISABLE_SIGNUP) {
    return <DisabledMessage message="Signups are disabled." />;
  }
  async function handleSignup(formData: FormData) {
    "use server";
    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const consent = formData.get("consent") === "on";

    if (!consent) {
      redirect(
        `/wiki/System_SignUp?error=${encodeURIComponent(
          "You must agree to the terms and conditions",
        )}`,
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      },
    );

    if (res.ok) {
      // Redirect to signin page with success message
      redirect(
        `/wiki/System_SignIn?success=${encodeURIComponent("Account created successfully. Please sign in.")}`,
      );
    } else {
      const data = await res.json();
      redirect(
        `/wiki/System_SignUp?error=${encodeURIComponent(
          data.error || "An unexpected error occurred",
        )}`,
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
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
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
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            required
            className="h-4 w-4 accent-violet-500"
          />
          <label htmlFor="consent" className="select-none">
            I agree to the terms and conditions.
          </label>
        </div>
        <TransitionFormButton
          useButtonWithoutForm={true}
          className="w-full bg-violet-500 text-white hover:bg-violet-600"
        >
          <UserPlusIcon className="inline size-5" />
          Sign Up
        </TransitionFormButton>
      </form>
      <div className="text-center">
        <Link href="/wiki/System_SignIn" className="mt-4 inline-block">
          Already have an account? <span className="underline">Sign In</span>
        </Link>
        {/* <p className="text-red-500">{error && <span>{error}</span>}</p> */}
      </div>
    </div>
  );
}
