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
        {user.username ? (
          <div className="flex gap-2 items-center">
            <p className="font-bold hover:underline"><Link href={`/dashboard`}>{user.username}</Link></p>
            <form action={signOutUser}>
              <button type="submit" className="cursor-pointer hover:underline">Sign Out</button>
            </form>
          </div>
        ) : (
          <Link className="hover:underline" href={"/signin"}>Sign In</Link>
        )}
      </header>
    </>
  );
}
