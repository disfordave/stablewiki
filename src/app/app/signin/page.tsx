import { TransitionFormButton } from "@/components/ui";
import { getUser } from "@/lib/auth/functions";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

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

    if (!res.ok) {
      redirect(
        `/app/signin?error=${encodeURIComponent("An unexpected error occurred")}`,
      );
    }

    const data = await res.json();

    const cookieStore = await cookies();
    cookieStore.set({
      name: "jwt",
      value: data.user.token,
      httpOnly: true,
      sameSite: "lax",
    });

    redirect(`/app/dashboard`);
  }

  const params = await searchParams;
  const error = params.error as string | undefined;
  const success = params.success as string | undefined;
  return (
    <div>
      <h1 className="mb-4 text-4xl font-bold">Sign In</h1>

      <form action={signIn} className="mt-4 flex flex-col gap-4">
        <div>
          <label htmlFor="username" className="mb-1 block">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="w-full rounded-full border border-gray-300 px-2 py-1 dark:border-gray-600"
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
            className="w-full rounded-full border border-gray-300 px-2 py-1 dark:border-gray-600"
          />
        </div>
        <TransitionFormButton
          useButtonWithoutForm={true}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Sign In
        </TransitionFormButton>
      </form>
      <Link href="/app/signup" className="mt-4 inline-block">
        Don&apos;t have an account? <span className="underline">Sign Up</span>
      </Link>
      <p className="text-green-500">{success && <span>{success}</span>}</p>
      <p className="text-red-500">{error && <span>{error}</span>}</p>
    </div>
  );
}
