import { assertEquals } from "@std/assert";
import { factory, Utils } from "../solarSave.ts";

const input = "Once upon a time in a solarpunk world...";

Deno.test(
  "solarSaveNode should call saveToFile and onSaveComplete when user says yes",
  async () => {
    let savedContent: string | undefined;

    const utils: Utils = {
      readLine: (_msg: string) => "y",
      saveToFile: async (content: string) => {
        savedContent = await Promise.resolve(content);
        return true;
      },
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSaveComplete: "onSaveComplete" },
      utils,
    )(input);

    assertEquals(result[0], "onSaveComplete");
    assertEquals(savedContent, input);
    assertEquals(result[1], undefined);
  },
);

Deno.test(
  "solarSaveNode should skip saveToFile and still call onSaveComplete when user says no",
  async () => {
    let saveCalled = false;

    const utils: Utils = {
      readLine: (_msg: string) => "n",
      saveToFile: async (_content: string) => {
        saveCalled = await Promise.resolve(true);
        return true;
      },
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onSaveComplete: "onSaveComplete" },
      utils,
    )(input);

    assertEquals(result[0], "onSaveComplete");
    assertEquals(saveCalled, false);
    assertEquals(result[1], undefined);
  },
);

Deno.test(
  "solarSaveNode should print failure message and still call onSaveComplete when saveToFile returns false",
  async () => {
    const printed: string[] = [];

    const utils: Utils = {
      readLine: (_msg: string) => "y",
      saveToFile: async (_content: string) => await Promise.resolve(false),
      print: (msg: string) => printed.push(msg),
    };

    const result = await factory(
      { onSaveComplete: "onSaveComplete" },
      utils,
    )(input);

    assertEquals(result[0], "onSaveComplete");
    assertEquals(
      printed.some((m) => m.includes("Failed")),
      true,
    );
    assertEquals(result[1], undefined);
  },
);
