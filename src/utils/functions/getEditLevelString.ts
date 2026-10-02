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

import { WIKI_HOMEPAGE_LINK } from "@/config";
import { getEditLevelRequirement } from "./editLevels";

export function getAccessEditLevelString(
  editLevel: number,
  title?: string,
): string {
  if (title && editLevel === 0) {
    if (title.startsWith("User:")) {
      return `User's own page (${title.split("/")[0]} and admins only)`;
    } else if (title.startsWith("Wiki:")) {
      return "Editors and above";
    } else if (title.startsWith("System:")) {
      return "Admin Only";
    } else if (title === WIKI_HOMEPAGE_LINK.slice(6)) {
      return "Editors and above";
    }
  }

  // Described from the same table the permission check uses
  const { role, minAccountAgeDays } = getEditLevelRequirement(editLevel);
  switch (role) {
    case "USER":
      return minAccountAgeDays > 0
        ? `Signed In Users after ${minAccountAgeDays} days`
        : "Signed In Users";
    case "MODERATOR":
      return "Moderators and above";
    case "EDITOR":
      return "Editors and above";
    case "ADMIN":
      return "Admin Only";
  }
}
