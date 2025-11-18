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

import { diffChars } from "diff";

export default function StableDiffViewer({
  oldContent,
  newContent,
  oldVer,
  newVer,
}: {
  oldContent?: string;
  newContent?: string;
  oldVer?: number | "latest";
  newVer?: number | "latest";
}) {
  // Placeholder for the actual diff viewer implementation
  const diffs = diffChars(oldContent || "", newContent || "");

  return (
    <div>
      <div>
        <p className="mt-3">
          {oldContent === newContent
            ? "No differences found."
            : `Differences between versions ${oldVer} and ${newVer}:`}
        </p>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-gray-100 p-4 whitespace-pre-wrap dark:bg-gray-900">
          {diffs.map((part, index) => {
            const color = part.added
              ? "bg-green-200 dark:bg-green-800"
              : part.removed
                ? "bg-red-200 dark:bg-red-800"
                : "";
            return (
              <span key={index} className={color}>
                {part.value}
              </span>
            );
          })}
        </pre>
      </div>
      {oldContent === newContent ? (
        <p className="mt-4 text-sm text-gray-500">
          No differences between the selected versions.
        </p>
      ) : (
        <details>
          <summary className="mt-4 mb-2 font-bold select-none">
            View Raw Versions
          </summary>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">
                Old Content{" "}
                {oldVer && (
                  <span className="text-gray-500">
                    ({oldVer === "latest" ? "latest" : `ver. ${oldVer}`})
                  </span>
                )}
              </h3>
              <pre className="max-h-96 overflow-auto rounded-xl bg-gray-100 p-4 whitespace-pre-wrap dark:bg-gray-900">
                {oldContent ? oldContent : "No previous content available."}
              </pre>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">
                New Content{" "}
                {newVer && (
                  <span className="text-gray-500">
                    ({newVer === "latest" ? "latest" : `ver. ${newVer}`})
                  </span>
                )}
              </h3>
              <pre className="max-h-96 overflow-auto rounded-xl bg-gray-100 p-4 whitespace-pre-wrap dark:bg-gray-900">
                {newContent ? newContent : "No new content available."}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
