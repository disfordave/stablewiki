import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  async function signIn(formData: FormData) {
    "use server";

    const rawFormData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    const res = await fetch("http://localhost:3000/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawFormData),
    });

    if (!res.ok) {
      redirect(
        `/signin?error=${encodeURIComponent("An unexpected error occurred")}`
      );
    }

    const data = await res.json();

            const cookieStore = await cookies()
        cookieStore.set({
          name: 'jwt',
          value: data.user.token,
          httpOnly: true,
          sameSite: 'lax'
        })

    redirect(
      `/?success=${encodeURIComponent(
        "Successfully signed in, Hello " + data.user.username + "!"
      )}`
    );
  }

  const params = await searchParams;
  const error = params.error as string | undefined;
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
        <p>{error && <span>{error}</span>}</p>
      </form>
    </>
  );
}
