import { TransitionFormButton } from "@/components/ui";
import { WIKI_DISABLE_SIGNUP, WIKI_NAME } from "@/config";
import { getUser } from "@/lib/auth/functions";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/solid";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign In | " + WIKI_NAME,
  description: "Sign in to your " + WIKI_NAME + " account.",
};

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getUser();
  if (user.username) {
    redirect(`/app/dashboard`);
  }

  async function signIn(formData: FormData) {
    "use server";

    if (user.username) {
      redirect(`/app/dashboard`);
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

      redirect(`/app/dashboard`);
    } else {
      const data = await res.json();
      redirect(
        `/app/signin?error=${encodeURIComponent(
          data.error || "An unexpected error occurred",
        )}`,
      );
    }
  }

  const params = await searchParams;
  const error = params.error as string | undefined;
  const success = params.success as string | undefined;
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
        <TransitionFormButton
          useButtonWithoutForm={true}
          className="w-full bg-violet-500 text-white hover:bg-violet-600"
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
          <Link href="/app/signup" className="mt-4 inline-block">
            Don&apos;t have an account?{" "}
            <span className="underline">Sign Up</span>
          </Link>
        )}
        <p className="text-green-500">{success && <span>{success}</span>}</p>
        <p className="text-red-500">{error && <span>{error}</span>}</p>
      </div>
    </div>
  );
}
