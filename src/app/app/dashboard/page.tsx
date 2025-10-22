import { getUser } from "@/lib/auth/functions";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();

  if (user.error) {
    return (
      <>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You must be signed in to view this page.</p>
        <p>
          <Link href="/app/signin">
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              Go to Sign In
            </button>
          </Link>
        </p>
      </>
    );
  }

  async function deleteAccount() {
    "use server";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/danger/user`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.username }),
      },
    );

    if (res.ok) {
      // Redirect to signin page with success message
      const cookieStore = await cookies();
      cookieStore.delete("jwt");
      redirect(
        `/app/signin?success=${encodeURIComponent("Account deleted successfully")}`,
      );
    } else {
      const data = await res.json();
      redirect(
        `/app/dashboard?error=${encodeURIComponent(
          data.error || "An unexpected error occurred",
        )}`,
      );
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">{user.username}&apos;s Dashboard</h1>

      {user.avatarUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={100}
            height={100}
            src={user.avatarUrl}
            alt={`${user.username}'s Avatar`}
            className="rounded-2xl"
          />
        </>
      )}
      <p>Welcome to your dashboard!</p>
      <p>Here you can manage your account and view your activity.</p>
      <p>This is a placeholder page. More features will be added soon!</p>
      <p>Your Role: {user.role as Role | null}</p>
      {user.role === Role.ADMIN && (
        <p className="text-red-500 font-bold">
          You have administrative privileges.
        </p>
      )}

      <h2 className="text-xl font-bold mt-4 mb-2">User Details (Debug Info)</h2>
      <pre className="overflow-auto p-4 rounded-2xl bg-white dark:bg-gray-800">
        {JSON.stringify(user, null, 2)}
      </pre>
      <p>
        <Link href="/">
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Go to Home
          </button>
        </Link>
      </p>
      {/* <>
        <form action={deleteAccount}>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete Account
          </button>
        </form>
      </> */}
    </>
  );
}
