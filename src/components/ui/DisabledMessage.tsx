import { WIKI_HOMEPAGE_LINK } from "@/config";
import Link from "next/link";

export function DisabledMessage({ message }: { message: string }) {
    return (
        <>
        <div>{message}</div>
        <Link href={WIKI_HOMEPAGE_LINK} className="mt-4 inline-block underline">
          Go to Homepage
        </Link>
        </>
    )
}