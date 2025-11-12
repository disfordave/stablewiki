/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
