import { describe, expect, it } from "vitest";
import { normalizeStreamUrl } from "@/lib/streams";

describe("normalizeStreamUrl", () => {
  it("keeps a plain https URL and trims it", () => {
    expect(normalizeStreamUrl("  https://tv.example.org/ecclesia-tv.m3u8 ")).toBe(
      "https://tv.example.org/ecclesia-tv.m3u8"
    );
  });

  it.each([
    ["plaintext http", "http://tv.example.org/a.m3u8"],
    ["javascript:", "javascript:alert(1)"],
    ["a relative path", "/stream.m3u8"],
    ["text with spaces", "https://tv.example.org/a b"],
    ["empty", ""],
    ["whitespace only", "   "],
  ])("rejects %s", (_label, value) => {
    expect(normalizeStreamUrl(value)).toBe("");
  });

  it("treats null and undefined as no stream", () => {
    expect(normalizeStreamUrl(null)).toBe("");
    expect(normalizeStreamUrl(undefined)).toBe("");
  });
});
