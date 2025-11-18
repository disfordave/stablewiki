import { prisma } from "@/lib/prisma";
import { PublicUser } from "@/types";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username: username as string },
    });

    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    return Response.json(
      {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
        status: user.status,
      } as PublicUser,
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Invalid or expired token." },
      { status: 403 },
    );
  }
}
