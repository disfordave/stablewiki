import { WIKI_HOMEPAGE_LINK } from "@/lib/config";
import { redirect } from "next/navigation";

export default function Home() {
  return redirect(WIKI_HOMEPAGE_LINK);
}
