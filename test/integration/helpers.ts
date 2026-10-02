import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/server/auth/session";

// Empties every table between tests (setup.ts guarantees a local database)
export async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Reaction", "NegativeReaction", "Comment", "WikiLink",
      "Revision", "Page", "TrustCredit", "SystemLog", "User"
    RESTART IDENTITY CASCADE
  `);
}

export async function createUser(
  username: string,
  role: Role = "USER",
  { status = 0 }: { status?: number } = {},
): Promise<SessionUser> {
  return prisma.user.create({
    data: { username, password: "not-used-in-these-tests", role, status },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      status: true,
    },
  });
}
