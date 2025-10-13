import { getUser } from "@/lib/auth/functions";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getUser();

  if (user.error) {
    return (
      <>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You must be signed in to view this page.</p>
        <p>
          <Link href="/signin">
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              Go to Sign In
            </button>
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <p>Welcome to your dashboard!</p>
      <p>Here you can manage your account and view your activity.</p>
      <p>This is a placeholder page. More features will be added soon!</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <p>
        <Link href="/">
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Go to Home
          </button>
        </Link>
      </p>
    </>
  );
}
