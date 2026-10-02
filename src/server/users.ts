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

import "server-only";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { PublicUser } from "@/types";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { z } from "zod";
import type { SessionUser } from "./auth/session";
import { hasRole } from "./authz";
import { ServiceError, hasErrorCode } from "./errors";
import { parseInput } from "./validation";

export const getPublicUser = cache(
  async (username: string): Promise<PublicUser | null> =>
    prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        status: true,
      },
    }),
);

const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string({ error: "Current password and new password are required" })
      .min(1, "Current password and new password are required"),
    newPassword: z
      .string({ error: "Current password and new password are required" })
      .min(8, "Password must be at least 8 characters long"),
    newPasswordConfirm: z.string({ error: "Passwords do not match" }),
  })
  .refine((input) => input.newPassword === input.newPasswordConfirm, {
    error: "Passwords do not match",
  });

export async function changePassword(user: SessionUser | null, input: unknown) {
  if (!user) {
    throw new ServiceError(401, "Unauthorized");
  }

  const { currentPassword, newPassword } = parseInput(
    passwordChangeSchema,
    input,
  );

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  });

  if (!account || !(await bcrypt.compare(currentPassword, account.password))) {
    throw new ServiceError(401, "Current password is incorrect");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(newPassword, 10) },
  });
}

// - 0 for active, 1 for banned
// - 101 for normal user, 102 for moderators, 103 for editors, 109 for admins
const USER_STATUS_CHANGES: Record<number, { status: number } | { role: Role }> =
  {
    0: { status: 0 },
    1: { status: 1 },
    101: { role: "USER" },
    102: { role: "MODERATOR" },
    103: { role: "EDITOR" },
    109: { role: "ADMIN" },
  };

function requireAdmin(user: SessionUser | null): SessionUser {
  if (!user || !hasRole(user, "ADMIN")) {
    throw new ServiceError(401, "Unauthorized");
  }
  return user;
}

export async function setUserStatus(
  viewer: SessionUser | null,
  username: string,
  status: unknown,
) {
  const admin = requireAdmin(viewer);

  const change =
    typeof status === "number" && Number.isInteger(status)
      ? USER_STATUS_CHANGES[status]
      : undefined;
  if (!change) {
    throw new ServiceError(400, "Invalid status value");
  }

  // Prevents admins from locking themselves out of the admin panel
  if (username === admin.username) {
    throw new ServiceError(400, "You cannot change your own status or role");
  }

  if ((await prisma.user.count()) <= 1) {
    throw new ServiceError(
      400,
      "Cannot change status of the only user in the system",
    );
  }

  try {
    return await prisma.user.update({
      where: { username },
      data: change,
      // Never send password hashes or other private fields back
      select: { id: true, username: true, role: true, status: true },
    });
  } catch (error) {
    if (hasErrorCode(error, "P2025")) {
      throw new ServiceError(404, "Not Found");
    }
    throw error;
  }
}

// - 0-9 sets the page's edit level
// - 101 enables and 102 disables the page's Lounge
export async function setPageAccessLevel(
  viewer: SessionUser | null,
  slug: unknown,
  accessLevel: unknown,
) {
  requireAdmin(viewer);

  if (
    typeof accessLevel !== "number" ||
    !Number.isInteger(accessLevel) ||
    accessLevel < 0 ||
    (accessLevel > 9 && accessLevel < 101) ||
    accessLevel > 102
  ) {
    throw new ServiceError(400, "Invalid status value");
  }
  if (typeof slug !== "string" || !slug) {
    throw new ServiceError(400, "Target page slug is required");
  }

  try {
    return await prisma.page.update({
      where: { slug },
      data:
        accessLevel >= 101
          ? { loungeDisabled: accessLevel === 102 }
          : { accessLevel },
    });
  } catch (error) {
    if (hasErrorCode(error, "P2025")) {
      throw new ServiceError(404, "Not Found");
    }
    throw error;
  }
}
