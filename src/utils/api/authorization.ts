import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function validAuthorizationWithJwt(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return false;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return false;
    }

    if (!process.env.JWT_SECRET) {
      return false;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      username: string;
      avatarUrl?: string;
      role: string;
    };

    if (!decodedToken) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error validating JWT:", error);
    return false;
  }
}
