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

import type { Role } from "@/generated/prisma/client";

export const ROLE_RANK: Record<Role, number> = {
  USER: 0,
  MODERATOR: 1,
  EDITOR: 2,
  ADMIN: 3,
};

export interface EditLevelRequirement {
  role: Role;
  minAccountAgeDays: number;
}

// What a page's edit level (Page.accessLevel) requires. This one table drives
// both the permission check and the "Edit Level" text shown on every page.
export function getEditLevelRequirement(level: number): EditLevelRequirement {
  if (level <= 0) {
    return { role: "USER", minAccountAgeDays: 0 };
  }
  if (level === 2) {
    return { role: "USER", minAccountAgeDays: 14 };
  }
  if (level <= 7) {
    return { role: "MODERATOR", minAccountAgeDays: 0 };
  }
  if (level === 8) {
    return { role: "EDITOR", minAccountAgeDays: 0 };
  }
  return { role: "ADMIN", minAccountAgeDays: 0 };
}
