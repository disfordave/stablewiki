import {
  DocumentTextIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/solid";
import { MustSignInMessage, TransitionLinkButton } from "../ui";
import StableDiffViewer from "./StableDiffViewer";
import { getUser } from "@/lib/auth/functions";

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
  return (
    <>
      <StableDiffViewer
        oldContent={currentContent}
        newContent={newTargetContent}
        newVer={Number(targetVersion)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <TransitionLinkButton
          href={`/wiki/${slug}?action=history`}
          className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
        >
          <DocumentTextIcon className="inline size-5" />
          History
        </TransitionLinkButton>
        <TransitionLinkButton
          href={`/wiki/${slug}?action=history`}
          className="mt-4 bg-red-500 text-white hover:bg-red-600"
        >
          <ArrowUturnLeftIcon className="inline size-5" />
          Revert to ver. {targetVersion}
        </TransitionLinkButton>
      </div>
    </>
  );
}
