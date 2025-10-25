import { Suspense } from "react";
import StableSearch from "./StableSearch";
import { WIKI_DISABLE_MEDIA } from "@/config";
import { LoadingSkeleton } from "../ui";
import DashboardPage from "./auth/DashboardPage";
import SignInPage from "./auth/SignInPage";
import SignupPage from "./auth/SignUpPage";

export default function SystemPages({
  slug,
  q,
}: {
  slug: string[];
  q: string | string[] | undefined;
}) {
  const systemPage = slug[0].replace("System_", "");
  switch (systemPage) {
    case "Search":
      return (
        <div>
          <Suspense fallback={<LoadingSkeleton />}>
            <h1 className="text-2xl font-bold">Search Results for {q}</h1>
            <StableSearch query={q} />
          </Suspense>
        </div>
      );
    case "SignIn":
      return <SignInPage />;
    case "Dashboard":
      return <DashboardPage />;
    case "SignUp":
      return <SignupPage />;
    case "Upload":
      return (
        <div>
          <h1 className="text-3xl font-bold">Upload Media</h1>
          {WIKI_DISABLE_MEDIA ? (
            <p>Media uploads are disabled.</p>
          ) : (
            <p>
              <p>{`This is a placeholder for the Upload Media page, Stay tuned for updates! (until then use '/app/upload')`}</p>
            </p>
          )}
        </div>
      );
    default:
      return (
        <div>
          <h1 className="text-3xl font-bold">System Page: {systemPage}</h1>
          <p>{`This is a placeholder for the System Page "${systemPage}".`}</p>
        </div>
      );
  }
}
