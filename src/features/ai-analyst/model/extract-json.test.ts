import { describe, expect, it } from "vitest";

import { extractJson } from "./extract-json";

describe("extractJson", () => {
  it("parses a plain JSON object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips ```json fences", () => {
    const raw = '```json\n{"headline":"hi"}\n```';
    expect(extractJson(raw)).toEqual({ headline: "hi" });
  });

  it("strips bare ``` fences (case-insensitive)", () => {
    const raw = "```JSON {\"ok\":true} ```";
    expect(extractJson(raw)).toEqual({ ok: true });
  });

  it("slices from the first { to the last } ignoring surrounding prose", () => {
    const raw = 'Here is your analysis:\n{"n":42}\nHope that helps!';
    expect(extractJson(raw)).toEqual({ n: 42 });
  });

  it("falls back to the whole (trimmed) string when there is no object", () => {
    expect(extractJson("  99  ")).toBe(99);
  });

  it("throws on malformed JSON", () => {
    expect(() => extractJson("{not valid}")).toThrow();
  });
});
