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

import path from "path";

export const MAX_MEDIA_BYTES = 1 * 1024 * 1024;

export type MediaType =
  "image/png" | "image/jpeg" | "image/gif" | "image/webp" | "image/svg+xml";

const EXTENSIONS: Record<MediaType, string[]> = {
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
  "image/svg+xml": ["svg"],
};

const CONTENT_TYPES: Record<string, MediaType> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

// Served media can never run as a document of this origin: an SVG opened
// directly gets no scripts, no network access and a unique sandboxed origin.
export const MEDIA_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy":
    "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
} as const;

// Scripts in uploaded SVGs are refused outright. The headers above are the
// real protection; this keeps obviously hostile files out of the wiki.
const UNSAFE_SVG_PATTERNS = [
  /<script/i,
  /<foreignObject/i,
  /<iframe/i,
  /<embed/i,
  /<object/i,
  /<!ENTITY/i,
  /\son[a-z]+\s*=/i,
  /javascript:/i,
];

// Titles become file names (and storage keys), so anything that could act
// as a path is refused
export function isSafeMediaTitle(title: string): boolean {
  const trimmed = title.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= 200 &&
    !trimmed.startsWith(".") &&
    !/[/\\\p{Cc}]/u.test(trimmed)
  );
}

// Identifies the file from its leading bytes; the client's MIME type is not trusted
export function sniffMediaType(bytes: Uint8Array): MediaType | null {
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((byte, i) => bytes[offset + i] === byte);

  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (startsWith([0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }
  if (
    startsWith([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return "image/gif";
  }
  if (
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    startsWith([0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }
  if (looksLikeSvg(bytes)) {
    return "image/svg+xml";
  }
  return null;
}

function looksLikeSvg(bytes: Uint8Array): boolean {
  const head = new TextDecoder()
    .decode(bytes.subarray(0, 4096))
    .replace(/^﻿/, "");
  // Skip the XML declaration, comments and doctype that may precede the root
  const root = head.replace(
    /^\s*(<\?xml[\s\S]*?\?>\s*)?(<!--[\s\S]*?-->\s*|<!DOCTYPE[^>]*>\s*)*/i,
    "",
  );
  return /^<svg[\s>]/i.test(root);
}

export function isUnsafeSvg(svg: string): boolean {
  return UNSAFE_SVG_PATTERNS.some((pattern) => pattern.test(svg));
}

// Keeps the uploader's extension when it matches the detected type
export function getMediaExtension(type: MediaType, fileName: string): string {
  const requested = fileName.split(".").pop()?.toLowerCase() ?? "";
  const allowed = EXTENSIONS[type];
  return allowed.includes(requested) ? requested : allowed[0];
}

export function getMediaContentType(fileName: string): string {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}
