import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return Response.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    let token;
    try {
      //Creating jwt token
      token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
    } catch (err) {
      console.log(err);
      return Response.json(
        { error: "Failed to sign in user from JWT" },
        { status: 500 }
      );
    }

    const response = Response.json({
      message: "Login successful! Happy reading!",
      user: { id: user.id, username: user.username, avatarUrl: user.avatarUrl, role: user.role, token },
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "jwt",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });

    return response;
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to sign in user" }, { status: 500 });
  }
}
