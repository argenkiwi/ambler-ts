import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { SolarSaveNode } from "./solarSaveNode.ts";

const baseState: SolarSaveNode.State = {
  generatedStory: "Once upon a time in a solarpunk world...",
};

Deno.test("solarSaveNode should call saveToFile and onSaveComplete when user says yes", async () => {
  let savedContent: string | undefined;
  let callbackState: SolarSaveNode.State | undefined;

  const utils: SolarSaveNode.Utils = {
    readLine: async (_msg) => "y",
    saveToFile: async (content) => { savedContent = content; return true; },
    print: () => {},
  };

  const result = await SolarSaveNode.create(
    { onSaveComplete: (s) => { callbackState = s; } },
    utils,
  )(baseState);

  assertEquals(result, null);
  assertEquals(savedContent, baseState.generatedStory);
  assertEquals(callbackState, baseState);
});

Deno.test("solarSaveNode should skip saveToFile and still call onSaveComplete when user says no", async () => {
  let saveCalled = false;
  let callbackState: SolarSaveNode.State | undefined;

  const utils: SolarSaveNode.Utils = {
    readLine: async (_msg) => "n",
    saveToFile: async (_content) => { saveCalled = true; return true; },
    print: () => {},
  };

  const result = await SolarSaveNode.create(
    { onSaveComplete: (s) => { callbackState = s; } },
    utils,
  )(baseState);

  assertEquals(result, null);
  assertEquals(saveCalled, false);
  assertEquals(callbackState, baseState);
});

Deno.test("solarSaveNode should print failure message and still call onSaveComplete when saveToFile returns false", async () => {
  const printed: string[] = [];
  let callbackState: SolarSaveNode.State | undefined;

  const utils: SolarSaveNode.Utils = {
    readLine: async (_msg) => "y",
    saveToFile: async (_content) => false,
    print: (msg) => printed.push(msg),
  };

  const result = await SolarSaveNode.create(
    { onSaveComplete: (s) => { callbackState = s; } },
    utils,
  )(baseState);

  assertEquals(result, null);
  assertEquals(printed.some((m) => m.includes("Failed")), true);
  assertEquals(callbackState, baseState);
});
