/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import StableSearch from "./SystemSearch";
import DashboardPage from "./auth/DashboardPage";
import SignInPage from "./auth/SignInPage";
import SignupPage from "./auth/SignUpPage";
import StableUpload from "./SystemUpload";
import { SearchBox } from "../ui";
import { WIKI_NAME } from "@/config";
import { StableEditor } from "../wiki";

export default function SystemPages({
  slug,
  q,
  hPage,
}: {
  slug: string[];
  q: string | string[] | undefined;
  hPage?: string | string[] | undefined;
}) {
  const systemPage = slug[0].replace(encodeURIComponent("System:"), "");
  switch (systemPage) {
    case "Search":
      return (
        <div>
          {!q ||
          (Array.isArray(q) && q.length === 0) ||
          (typeof q === "string" && q.trim() === "") ? (
            <h1 className="text-3xl font-bold">Search {WIKI_NAME}</h1>
          ) : (
            <h1 className="text-3xl font-bold">
              Search Results for &quot;{q}&quot;
            </h1>
          )}
          <div className="mb-2">
            <SearchBox />
          </div>
          <StableSearch query={q} hPage={hPage} />
        </div>
      );
    case "SignIn":
      return <SignInPage />;
    case "Dashboard":
      return <DashboardPage />;
    case "SignUp":
      return <SignupPage />;
    case "CreatePage":
      return (
        <>
          <h1 className="text-3xl font-bold">Create New Page</h1>
          <p>
            Make sure not to create a page that already exists! Use the search
            feature to check first or it will throw an error.
          </p>
          <div className="mt-2">
            <StableEditor
              page={undefined}
              slug={"System:CreatePage"}
              isSystemNewPage={true}
            />
          </div>
        </>
      );
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
