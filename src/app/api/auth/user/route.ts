import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return Response.json(
      { error: "Error! Token was not provided." },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return Response.json(
      { error: "Error! Token was not provided." },
      { status: 401 }
    );
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in the environment variables.");
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      username: string;
      avatarUrl?: string;
      role: string;
    };

    return Response.json(
      { id: decodedToken.id, username: decodedToken.username, avatarUrl: decodedToken.avatarUrl, role: decodedToken.role, token },
      { status: 200 }
    );
  } catch (error) {
    console.log(token);
    console.error(error);
    return Response.json(
      { error: "Invalid or expired token." },
      { status: 403 }
    );
  }
}
