import {
  DocumentTextIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/solid";
import {
  MustSignInMessage,
  TransitionFormButton,
  TransitionLinkButton,
} from "../ui";
import StableDiffViewer from "./StableDiffViewer";
import { getUser } from "@/lib/auth/functions";
import { redirect } from "next/navigation";

export default async function StableRevert({
  currentContent,
  newTargetContent,
  slug,
  targetVersion,
}: {
  currentContent: string;
  newTargetContent: string;
  slug: string;
  targetVersion: string;
}) {
  const user = await getUser();

  if (!user.username) {
    return <MustSignInMessage />;
  }

  async function editPage(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;

    if (!user) {
      throw new Error("User not found");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${slug}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: decodeURIComponent(slug),
          content,
          author: user,
          summary: `Reverted to version ${targetVersion}`,
        }),
      },
    );

    if (!res.ok) {
      redirect(
        `/wiki/${slug}?action=edit&error=${encodeURIComponent("Failed to edit page")}`,
      );
    }

    const data = await res.json();
    console.log("Edit response data:", data);
    redirect(`/wiki/${slug}`);
  }
  return (
    <>
      <StableDiffViewer
        oldContent={currentContent}
        newContent={newTargetContent}
        newVer={Number(targetVersion)}
      />
      <form className="flex flex-col gap-4" action={editPage}>
        <input type="hidden" name="content" value={newTargetContent} />
        <div className="font-bold mt-4 animate-pulse">You&apos;re about to revert to version {targetVersion}.</div>
        <div className="flex flex-wrap items-center gap-2">
          <TransitionLinkButton
            href={`/wiki/${slug}?action=history`}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <DocumentTextIcon className="inline size-5" />
            History
          </TransitionLinkButton>
          <TransitionFormButton
            useButtonWithoutForm={true}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            <ArrowUturnLeftIcon className="inline size-5" />
            Revert to ver. {targetVersion}
          </TransitionFormButton>
        </div>
      </form>
    </>
  );
}
