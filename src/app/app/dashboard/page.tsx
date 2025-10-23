import { MustSignInMessage, TransitionFormButton, TransitionLinkButton } from "@/components/ui";
import { WIKI_DISABLE_MEDIA, WIKI_HOMEPAGE_LINK, WIKI_NAME } from "@/config";
import { getUser, signOutUser } from "@/lib/auth/functions";
import {
  HomeIcon,
  PhotoIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { Role } from "@prisma/client";

export const metadata = {
  title: "Dashboard | " + WIKI_NAME,
  description: "Your personal dashboard on " + WIKI_NAME + ".",
};

export default async function DashboardPage() {
  const user = await getUser();

  if (user.error) {
    return (
      <>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <MustSignInMessage />
      </>
    );
  }

  // async function deleteAccount() {
  //   "use server";
  //   const res = await fetch(
  //     `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/danger/user`,
  //     {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ username: user.username }),
  //     },
  //   );

  //   if (res.ok) {
  //     // Redirect to signin page with success message
  //     const cookieStore = await cookies();
  //     cookieStore.delete("jwt");
  //     redirect(
  //       `/app/signin?success=${encodeURIComponent("Account deleted successfully")}`,
  //     );
  //   } else {
  //     const data = await res.json();
  //     redirect(
  //       `/app/dashboard?error=${encodeURIComponent(
  //         data.error || "An unexpected error occurred",
  //       )}`,
  //     );
  //   }
  // }

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
        <p className="font-bold text-red-500">
          You have administrative privileges.
        </p>
      )}

      <h2 className="mt-4 mb-2 text-xl font-bold">User Details (Debug Info)</h2>
      <pre className="overflow-auto rounded-2xl bg-gray-100 p-4 dark:bg-gray-900">
        {JSON.stringify(user, null, 2)}
      </pre>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <TransitionLinkButton
            href={WIKI_HOMEPAGE_LINK}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <HomeIcon className="inline size-5" />
            Go to Home
          </TransitionLinkButton>
          {WIKI_DISABLE_MEDIA ? null : (
            <TransitionLinkButton
              href="/app/upload"
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <PhotoIcon className="inline size-5" />
              Upload
            </TransitionLinkButton>
          )}
        </div>
        <TransitionFormButton
          action={signOutUser}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          <ArrowLeftStartOnRectangleIcon className="inline size-5" />
          Sign Out
        </TransitionFormButton>
      </div>

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
