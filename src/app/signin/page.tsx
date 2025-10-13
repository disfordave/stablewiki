import { getUser } from "@/lib/auth/functions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getUser();
  if (user.username) {
    redirect(`/dashboard`);
  }

  async function signIn(formData: FormData) {
    "use server";

    if (user.username) {
      redirect(`/dashboard`);
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
      }
    );

    if (!res.ok) {
      redirect(
        `/signin?error=${encodeURIComponent("An unexpected error occurred")}`
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

    redirect(`/dashboard`);
  }

  const params = await searchParams;
  const error = params.error as string | undefined;
  const success = params.success as string | undefined;
  return (
    <>
      <form action={signIn}>
        <input name="username" type="text" placeholder="Username" required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <p className="text-green-500">{success && <span>{success}</span>}</p>
        <p className="text-red-500">{error && <span>{error}</span>}</p>
      </form>
    </>
  );
}
