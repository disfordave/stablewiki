import { PublicUser } from "@/types";
import Link from "next/link";

export default async function PublicUserInfo({
  username,
}: {
  username: string;
}) {
  async function fetchUserData(username: string): Promise<PublicUser | null> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user/${username}`,
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data as PublicUser;
  }

  const user = await fetchUserData(username);

  if (!user) {
    return <p>Failed to load user information.</p>;
  }

  return (
    <div className="mt-4 flex items-center rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
      <div>
        <h2 className="text-lg font-semibold">{user.username}</h2>

        <p className="text-sm text-gray-500">Role: {user.role}</p>
        <p className="text-sm text-gray-500">
          Status: {user.status === 0 ? "Active" : "Banned"}
        </p>
        <p className="text-sm text-gray-500">
          Joined on {new Date(user.createdAt).toLocaleDateString()}
        </p>
        <Link
          href={`/wiki/System:Revisions?username=${encodeURIComponent(user.username)}`}
          className="text-blue-500 hover:underline"
        >
          {user.username}&apos;s Revision History
        </Link>
      </div>
    </div>
  );
}
