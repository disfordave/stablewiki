import { describe, expect, it } from "vitest";
import {
  getMediaContentType,
  getMediaExtension,
  isSafeMediaTitle,
  isUnsafeSvg,
  sniffMediaType,
} from "@/utils/api/media";

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (value: string) => new TextEncoder().encode(value);

describe("isSafeMediaTitle", () => {
  it("accepts ordinary titles", () => {
    expect(isSafeMediaTitle("Logo")).toBe(true);
    expect(isSafeMediaTitle("Québec skyline 2024")).toBe(true);
    expect(isSafeMediaTitle("v1.2 diagram")).toBe(true);
  });

  it("rejects titles that could act as paths", () => {
    const titles = [
      "../../src/app/page",
      "a/b",
      "a\\b",
      ".env",
      " .hidden",
      "",
      "   ",
      "bad\u0000name",
      "tab\tname",
      "x".repeat(201),
    ];
    for (const title of titles) {
      expect([title, isSafeMediaTitle(title)]).toEqual([title, false]);
    }
  });
});

describe("sniffMediaType", () => {
  it("recognises supported formats by their bytes", () => {
    expect(
      sniffMediaType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0)),
    ).toBe("image/png");
    expect(sniffMediaType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffMediaType(text("GIF89a...."))).toBe("image/gif");
    expect(sniffMediaType(text("GIF87a...."))).toBe("image/gif");
    expect(sniffMediaType(text("RIFF\u0000\u0000\u0000\u0000WEBPVP8 "))).toBe(
      "image/webp",
    );
  });

  it("recognises SVG with or without a prolog", () => {
    expect(
      sniffMediaType(text('<svg xmlns="http://www.w3.org/2000/svg"></svg>')),
    ).toBe("image/svg+xml");
    expect(
      sniffMediaType(
        text(
          '﻿<?xml version="1.0"?>\n<!-- logo -->\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg viewBox="0 0 1 1"/>',
        ),
      ),
    ).toBe("image/svg+xml");
  });

  it("rejects everything else, whatever the file is called", () => {
    expect(
      sniffMediaType(text("<html><script>alert(1)</script></html>")),
    ).toBeNull();
    expect(sniffMediaType(text("#!/bin/sh\necho hi"))).toBeNull();
    expect(sniffMediaType(bytes())).toBeNull();
  });
});

describe("isUnsafeSvg", () => {
  it("flags scripts and other active content", () => {
    const svgs = [
      "<svg><script>alert(1)</script></svg>",
      '<svg onload="alert(1)"></svg>',
      '<svg><a href="javascript:alert(1)"><text>x</text></a></svg>',
      '<svg><foreignObject><iframe src="x"/></foreignObject></svg>',
      '<!DOCTYPE svg [<!ENTITY a "aaaa">]><svg>&a;</svg>',
    ];
    for (const svg of svgs) {
      expect([svg, isUnsafeSvg(svg)]).toEqual([svg, true]);
    }
  });

  it("accepts plain drawings", () => {
    expect(
      isUnsafeSvg(
        '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" opacity="0.5"/></svg>',
      ),
    ).toBe(false);
  });
});

describe("getMediaExtension", () => {
  it("keeps a matching extension and replaces a misleading one", () => {
    expect(getMediaExtension("image/jpeg", "photo.JPEG")).toBe("jpeg");
    expect(getMediaExtension("image/jpeg", "photo.png")).toBe("jpg");
    expect(getMediaExtension("image/png", "shell.php")).toBe("png");
    expect(getMediaExtension("image/svg+xml", "no-extension")).toBe("svg");
  });
});

describe("getMediaContentType", () => {
  it("maps known extensions and falls back to a download type", () => {
    expect(getMediaContentType("a.svg")).toBe("image/svg+xml");
    expect(getMediaContentType("a.JPG")).toBe("image/jpeg");
    expect(getMediaContentType("a.html")).toBe("application/octet-stream");
  });
});
