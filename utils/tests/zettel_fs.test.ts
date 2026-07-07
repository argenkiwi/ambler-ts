import { assertEquals } from "@std/assert";
import { Note, parseNote, serializeNote } from "../zettel_fs.ts";

const note: Note = {
  id: "20260706120000",
  title: "Test note",
  tags: ["a", "b"],
  created: "2026-07-06T12:00:00.000Z",
  updated: "2026-07-06T12:00:00.000Z",
  links: [{ to: "20260101000000", relation: "builds on" }],
  body: "This is the body.\n\nWith multiple paragraphs.",
};

Deno.test("serializeNote/parseNote should round-trip a note", () => {
  const raw = serializeNote(note);
  const parsed = parseNote(raw);
  assertEquals(parsed, note);
});

Deno.test("serializeNote should produce Obsidian-compatible frontmatter delimiters", () => {
  const raw = serializeNote(note);
  assertEquals(raw.startsWith("---\n"), true);
  assertEquals(raw.includes("\n---\n"), true);
});

Deno.test("parseNote should default missing tags/links to empty arrays", () => {
  const raw = "---\n" +
    'id: "x"\n' +
    "title: Bare\n" +
    "created: 2026-01-01T00:00:00.000Z\n" +
    "updated: 2026-01-01T00:00:00.000Z\n" +
    "---\n\n" +
    "Body text\n";
  const parsed = parseNote(raw);
  assertEquals(parsed.tags, []);
  assertEquals(parsed.links, []);
});
