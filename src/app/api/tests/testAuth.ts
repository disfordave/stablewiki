import * as jose from "jose";

export const TEST_JWT_SECRET = "test-secret";

export function signTestToken(userId: string) {
  return new jose.SignJWT({ id: userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(TEST_JWT_SECRET));
}

export function testUser(
  id: string,
  username: string,
  role: "ADMIN" | "EDITOR" | "MODERATOR" | "USER",
) {
  return {
    id,
    username,
    role,
    avatarUrl: null,
    createdAt: new Date(),
    status: 0,
  };
}
