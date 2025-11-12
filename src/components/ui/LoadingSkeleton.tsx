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

export function LoadingSkeleton() {
  return (
    <div className="h-full">
      <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900"></div>
      <div className="mt-4 h-48 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900"></div>
    </div>
  );
}
