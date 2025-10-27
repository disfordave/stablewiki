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

export default function StableDiffViewer({
  oldContent,
  newContent,
  oldVer,
  newVer,
}: {
  oldContent?: string;
  newContent?: string;
  oldVer?: number;
  newVer?: number;
}) {
  // Placeholder for the actual diff viewer implementation
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold">
            Old Content{" "}
            {oldVer && <span className="text-gray-500">(ver. {oldVer})</span>}
          </h3>
          <pre className="max-h-96 overflow-auto rounded-xl bg-gray-100 p-4 whitespace-pre-wrap dark:bg-gray-900">
            {oldContent ? oldContent : "No previous content available."}
          </pre>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">
            New Content{" "}
            {newVer && <span className="text-gray-500">(ver. {newVer})</span>}
          </h3>
          <pre className="max-h-96 overflow-auto rounded-xl bg-gray-100 p-4 whitespace-pre-wrap dark:bg-gray-900">
            {newContent ? newContent : "No new content available."}
          </pre>
        </div>
      </div>
    </div>
  );
}
