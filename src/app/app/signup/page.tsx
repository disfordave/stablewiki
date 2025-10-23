import { WIKI_DISABLE_SIGNUP, WIKI_HOMEPAGE_LINK } from "@/config";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function SignupPage() {
  if (WIKI_DISABLE_SIGNUP) {
    return (
      <>
      <div>Signups are disabled.</div>
      <Link href={WIKI_HOMEPAGE_LINK} className="mt-4 inline-block underline">
        Go to Homepage
      </Link>
      </>
    )
  }
  async function handleSignup(formData: FormData) {
    "use server";
    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

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
      redirect(`/`);
    } else {
      const data = await res.json();
      redirect(
        `/app/signup?error=${encodeURIComponent(
          data.error || "An unexpected error occurred",
        )}`,
      );
    }
  }
  return (
    <div>
      <h1 className="mb-4 text-4xl font-bold">Sign Up</h1>
      <form action={handleSignup} className="mt-4 flex flex-col gap-4">
        <div>
          <label htmlFor="username" className="mb-1 block">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
