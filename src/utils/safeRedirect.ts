// utils/safeRedirect.ts
import { redirect } from "next/navigation";

/**
 * A drop-in replacement for Next.js `redirect()` that safely
 * encodes non-ASCII characters (é, ü, 你好, etc.) so Node headers
 * never throw `ERR_INVALID_CHAR`, while browsers still show
 * a decoded, human-readable URL.
 *
 * Usage: safeRedirect("/wiki/Québec")
 */
export function safeRedirect(href: string): never {
  // Encode only the *path and query* parts, not the full URL
  try {
    const url = new URL(href, process.env.NEXT_PUBLIC_BASE_URL); // base required for relative URLs
    const safePath = url.pathname
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");

    // Rebuild full encoded URL (browser will decode visually)
    const encoded = `${safePath}${url.search}${url.hash}`;
    redirect(encoded);
  } catch {
    // fallback: if parsing fails, still encode
    redirect(encodeURI(href));
  }
}
