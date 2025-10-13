import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

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

    if (!user || user.password !== password) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    let token;
    try {
      //Creating jwt token
      token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        "secretkeyappearshere",
        { expiresIn: "1h" }
      );
    } catch (err) {
      console.log(err);
      return Response.json(
        { error: "Failed to sign in user from JWT" },
        { status: 500 }
      );
    }

    return Response.json({
      message: "Login successful! Happy reading!",
      user: { id: user.id, username: user.username, token },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to sign in user" }, { status: 500 });
  }
}
