import { prisma } from "@/lib/prisma";
// import jwt from "jsonwebtoken";
import * as jose from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const JWT_EXPIRES_SECONDS = 60 * 60 * 24;
const DUMMY_HASH =
  "$2a$10$KIX/8sW3x3lP1n7i6E1w8u3hQKq5N7e2v1a8BqQH6G1nE7Hq1m0y."; // any valid bcrypt hash

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return Response.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    const hash = user?.password ?? DUMMY_HASH;

    if (!user || !(await bcrypt.compare(password, hash))) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    let token;
    try {
      //Creating jwt token
      token = await new jose.SignJWT({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
      })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime(`24h`) // Change this line
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));
    } catch (err) {
      console.log(err);
      return Response.json(
        { error: "Failed to sign in user from JWT" },
        { status: 500 },
      );
    }

    const clientType = request.headers.get("X-Client-Type");
    if (clientType === "mobile") {
      return Response.json(
        {
          message: "Login successful! Happy reading!",
          token: token,
          user: {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            role: user.role,
          },
        },
        { status: 200 },
      );
    }

    const response = Response.json({
      message: "Login successful! Happy reading!",
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        token,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "jwt",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: JWT_EXPIRES_SECONDS,
    });

    return response;
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to sign in user" }, { status: 500 });
  }
}
