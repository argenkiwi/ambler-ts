import { assertEquals } from "@std/assert";
import * as SolarSaveNode from "./solarSaveNode.ts";

const baseState: SolarSaveNode.State = {
  generatedStory: "Once upon a time in a solarpunk world...",
};

Deno.test(
  "solarSaveNode should call saveToFile and onSaveComplete when user says yes",
  async () => {
    let savedContent: string | undefined;

    const utils: SolarSaveNode.Utils = {
      readLine: (_msg) => "y",
      saveToFile: async (content) => {
        savedContent = await Promise.resolve(content);
        return true;
      },
      print: () => {},
    };

    const result = await SolarSaveNode.create(
      { onSaveComplete: "onSaveComplete" },
      utils,
    )(baseState);

    assertEquals(result[0], "onSaveComplete");
    assertEquals(savedContent, baseState.generatedStory);
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "solarSaveNode should skip saveToFile and still call onSaveComplete when user says no",
  async () => {
    let saveCalled = false;

    const utils: SolarSaveNode.Utils = {
      readLine: (_msg) => "n",
      saveToFile: async (_content) => {
        saveCalled = await Promise.resolve(true);
        return true;
      },
      print: () => {},
    };

    const result = await SolarSaveNode.create(
      { onSaveComplete: "onSaveComplete" },
      utils,
    )(baseState);

    assertEquals(result[0], "onSaveComplete");
    assertEquals(saveCalled, false);
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "solarSaveNode should print failure message and still call onSaveComplete when saveToFile returns false",
  async () => {
    const printed: string[] = [];

    const utils: SolarSaveNode.Utils = {
      readLine: (_msg) => "y",
      saveToFile: async (_content) => await Promise.resolve(false),
      print: (msg) => printed.push(msg),
    };

    const result = await SolarSaveNode.create(
      { onSaveComplete: "onSaveComplete" },
      utils,
    )(baseState);

    assertEquals(result[0], "onSaveComplete");
    assertEquals(
      printed.some((m) => m.includes("Failed")),
      true,
    );
    assertEquals(result[1], baseState);
  },
);
