import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { WIKI_DISABLE_SIGNUP } from "@/config";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (WIKI_DISABLE_SIGNUP) {
    return Response.json(
      { error: "User signup has been disabled." },
      { status: 403 },
    );
  }

  if (!username || !password) {
    return Response.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return Response.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        role: "USER", // Default role
      },
    });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    let token;
    // try {
    //   //Creating jwt token
    //   // token = jwt.sign(
    //   //   {
    //   //     id: newUser.id,
    //   //     username: newUser.username,
    //   //     avatarUrl: newUser.avatarUrl,
    //   //     role: newUser.role,
    //   //   },
    //   //   process.env.JWT_SECRET,
    //   //   { expiresIn: "1h" },
    //   // );
    // } catch (err) {
    //   console.log(err);
    //   return Response.json(
    //     { error: "Failed to sign up user from JWT" },
    //     { status: 500 },
    //   );
    // }

    const response = Response.json({
      message: "Signup successful! Welcome aboard!",
      user: {
        id: newUser.id,
        username: newUser.username,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        token,
      },
    });

    // const cookieStore = await cookies();
    // cookieStore.set({
    //   name: "jwt",
    //   value: token,
    //   httpOnly: true,
    //   sameSite: "lax",
    //   path: "/",
    //   maxAge: 3600,
    // });

    return response;
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to sign up user" }, { status: 500 });
  }
}
