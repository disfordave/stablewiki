/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Suspense } from "react";
import StableSearch from "./StableSearch";
import { LoadingSkeleton } from "../ui";
import DashboardPage from "./auth/DashboardPage";
import SignInPage from "./auth/SignInPage";
import SignupPage from "./auth/SignUpPage";
import StableUpload from "./StableUpload";

export default function SystemPages({
  slug,
  q,
}: {
  slug: string[];
  q: string | string[] | undefined;
}) {
  const systemPage = slug[0].replace(encodeURIComponent("System:"), "");
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
      return <StableUpload />;
    default:
      return (
        <div>
          <h1 className="text-3xl font-bold">System:{systemPage}</h1>
          <p>{`This is a placeholder for the System Page "${systemPage}".`}</p>
        </div>
      );
  }
}
