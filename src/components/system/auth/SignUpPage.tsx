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

const recoveryQuestions = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "In what city were you born?",
  "What is your favorite book?",
  "What was the make of your first car?",
  "What is your favorite food?",
  "What is the name of the street you grew up on?",
  "What was your childhood nickname?",
  "What is the name of your best friend from childhood?",
  "What was the name of your first employer?",
  "What is your favorite movie?",
  "What is your father's middle name?",
  "What was the name of your first crush?",
  "What is the name of your favorite teacher?",
  "What was the model of your first bicycle?",
  "What is your favorite vacation spot?",
  "What was the name of your first roommate?",
  "What is your favorite sport?",
  "What was the name of your first boss?",
];

export default async function SignupPage() {
  if (WIKI_DISABLE_SIGNUP) {
    return <DisabledMessage message="Signups are disabled." />;
  }
  async function handleSignup(formData: FormData) {
    "use server";
    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const passwordConfirm = formData.get("passwordConfirm")?.toString() || "";
    const recoveryQuestionFirst =
      formData.get("recoveryQuestionFirst")?.toString() || "";
    const recoveryAnswerFirst =
      formData.get("recoveryAnswerFirst")?.toString() || "";
    const recoveryQuestionSecond =
      formData.get("recoveryQuestionSecond")?.toString() || "";
    const recoveryAnswerSecond =
      formData.get("recoveryAnswerSecond")?.toString() || "";
    const recoveryQuestionThird =
      formData.get("recoveryQuestionThird")?.toString() || "";
    const recoveryAnswerThird =
      formData.get("recoveryAnswerThird")?.toString() || "";
    if (password !== passwordConfirm) {
      redirect(
        `/wiki/System:SignUp?error=${encodeURIComponent(
          "Passwords do not match",
        )}`,
      );
    }
    const consent = formData.get("consent") === "on";

    if (!consent) {
      redirect(
        `/wiki/System:SignUp?error=${encodeURIComponent(
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
        body: JSON.stringify({
          username,
          password,
          passwordConfirm,
          consent,
          recoveryQuestionFirst,
          recoveryAnswerFirst,
          recoveryQuestionSecond,
          recoveryAnswerSecond,
          recoveryQuestionThird,
          recoveryAnswerThird,
        }),
      },
    );

    if (res.ok) {
      // Redirect to signin page with success message
      redirect(
        `/wiki/System:SignIn?success=${encodeURIComponent("Account created successfully. Please sign in.")}`,
      );
    } else {
      const data = await res.json();
      redirect(
        `/wiki/System:SignUp?error=${encodeURIComponent(
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
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
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
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
          />
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Provide answers to your recovery questions to help secure your
            account. Each question must be unique.
          </p>
          <label htmlFor="recoveryQuestionFirst" className="block">
            Recovery Question 1:
          </label>
          <select
            id="recoveryQuestionFirst"
            name="recoveryQuestionFirst"
            required
            defaultValue={""}
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
          >
            <option value="" disabled>
              Select a recovery question
            </option>
            {recoveryQuestions.map((question, index) => (
              <option key={index} value={question}>
                {question}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="recoveryAnswerFirst" className="block">
            Recovery Answer 1:
          </label>
          <input
            type="text"
            id="recoveryAnswerFirst"
            name="recoveryAnswerFirst"
            required
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
          />
        </div>
        <div>
          <label htmlFor="recoveryQuestionSecond" className="block">
            Recovery Question 2:
          </label>
          <select
            id="recoveryQuestionSecond"
            name="recoveryQuestionSecond"
            required
            defaultValue={""}
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
          >
            <option value="" disabled>
              Select a recovery question
            </option>
            {recoveryQuestions.map((question, index) => (
              <option key={index} value={question}>
                {question}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="recoveryAnswerSecond" className="block">
            Recovery Answer 2:
          </label>
          <input
            type="text"
            id="recoveryAnswerSecond"
            name="recoveryAnswerSecond"
            required
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
          />
        </div>
        <div>
          <label htmlFor="recoveryQuestionThird" className="block">
            Recovery Question 3:
          </label>
          <select
            id="recoveryQuestionThird"
            name="recoveryQuestionThird"
            required
            defaultValue={""}
            className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
          >
            <option value="" disabled>
              Select a recovery question
            </option>
            {recoveryQuestions.map((question, index) => (
              <option key={index} value={question}>
                {question}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="recoveryAnswerThird" className="block">
            Recovery Answer 3:
          </label>
          <input
            type="text"
            id="recoveryAnswerThird"
            name="recoveryAnswerThird"
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
          className="w-full bg-violet-500 text-white hover:bg-violet-600"
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
