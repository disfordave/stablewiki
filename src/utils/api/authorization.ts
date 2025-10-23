import { NextRequest } from "next/server";
import * as jose from "jose";

export async function validAuthorizationWithJwt(
  request: NextRequest | Request,
): Promise<boolean> {
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

    const decodedToken = await jose
      .jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
      .then((result) => result.payload);

    if (!decodedToken) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error validating JWT:", error);
    return false;
  }
}
