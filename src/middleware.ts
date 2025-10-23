import type { NextRequest } from "next/server";

// Simple in-memory rate limiter for Next.js
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // max 5 requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return;
  }

  // Get IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0]
    : request.headers.get("x-real-ip") || "unknown";

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Too many requests, please try again later." },
      { status: 429 },
    );
  }
}

const config = {
  matcher: ["/api/auth/signin", "/api/auth/signup"],
};

export { config };
