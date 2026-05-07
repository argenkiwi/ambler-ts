import { factory, Utils } from "../storySave.ts";
import { assertEquals } from "@std/assert";

const input: string[] = ["Page one.", "Page two."];

Deno.test(
  "storySaveNode should call saveFile with joined pages and transition onSaveComplete",
  async () => {
    let savedContent: string | undefined;

    const utils: Utils = {
      saveFile: (_filename: string, content: string) => {
        savedContent = content;
        return Promise.resolve();
      },
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSaveComplete: "complete" },
      utils,
    )(input);

    assertEquals(result[0], "complete");
    assertEquals(savedContent, "Page one.\n\nPage two.");
    assertEquals(result[1], undefined);
  },
);

Deno.test(
  "storySaveNode should still transition onSaveComplete when saveFile throws",
  async () => {
    const utils: Utils = {
      saveFile: (_filename: string, _content: string) => {
        throw new Error("disk full");
      },
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSaveComplete: "complete" },
      utils,
    )(input);

    assertEquals(result[0], "complete");
    assertEquals(result[1], undefined);
  },
);
