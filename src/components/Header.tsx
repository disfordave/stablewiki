import { getUser, signOutUser } from "@/lib/auth/functions";
import { WIKI_NAME } from "@/lib/config";
import Link from "next/link";

export default async function Header() {
  const user = await getUser();

  return (
    <>
      <header className="flex justify-between">
        <p className="text-xl font-bold">
          <Link href={"/"}>{WIKI_NAME}</Link>
        </p>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        {user.username ? (
          <>
            <p>{user.username}</p>
            <form action={signOutUser}>
              <button type="submit">Sign Out</button>
            </form>
          </>
        ) : (
          <Link href={"/signin"}>Sign In</Link>
        )}
      </header>
    </>
  );
}
