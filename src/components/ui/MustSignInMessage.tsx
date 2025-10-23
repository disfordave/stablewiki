import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/solid";
import { TransitionLinkButton } from "./TransitionButton";

export function MustSignInMessage({customMessage}: {customMessage?: string}) {
    return (
        <>
        <div className="">
          <p className="mb-1">{customMessage || "You must be signed in to access this page."}</p>
          <TransitionLinkButton
            href="/app/signin"
            className="bg-violet-500 text-white hover:bg-violet-600"
          >
            <ArrowLeftEndOnRectangleIcon className="inline size-5" />
            Sign In
          </TransitionLinkButton>
        </div>
        </>
    )
}