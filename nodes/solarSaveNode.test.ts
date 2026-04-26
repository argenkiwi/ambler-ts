import { assertEquals } from "@std/assert";
import * as SolarSaveNode from "./solarSaveNode.ts";
import { stop, Node } from "../ambler.ts";

const baseState: SolarSaveNode.State = {
  generatedStory: "Once upon a time in a solarpunk world...",
};

Deno.test(
  "solarSaveNode should call saveToFile and onSaveComplete when user says yes",
  async () => {
    let savedContent: string | undefined;
    let callbackState: SolarSaveNode.State | undefined;

    const captureNext: Node<SolarSaveNode.State> = (s) => {
      callbackState = s;
      return stop();
    };

    const utils: SolarSaveNode.Utils = {
      readLine: (_msg) => "y",
      saveToFile: async (content) => {
        savedContent = await Promise.resolve(content);
        return true;
      },
      print: () => {},
    };

    const result = await SolarSaveNode.create(
      { onSaveComplete: captureNext },
      utils,
    )(baseState);

    let step = await result();
    while (typeof step === "function") {
      step = await step();
    }
    assertEquals(step, null);
    assertEquals(savedContent, baseState.generatedStory);
    assertEquals(callbackState, baseState);
  },
);

Deno.test(
  "solarSaveNode should skip saveToFile and still call onSaveComplete when user says no",
  async () => {
    let saveCalled = false;
    let callbackState: SolarSaveNode.State | undefined;

    const captureNext: Node<SolarSaveNode.State> = (s) => {
      callbackState = s;
      return stop();
    };

    const utils: SolarSaveNode.Utils = {
      readLine: (_msg) => "n",
      saveToFile: async (_content) => {
        saveCalled = await Promise.resolve(true);
        return true;
      },
      print: () => {},
    };

    const result = await SolarSaveNode.create(
      { onSaveComplete: captureNext },
      utils,
    )(baseState);

    let step = await result();
    while (typeof step === "function") {
      step = await step();
    }
    assertEquals(step, null);
    assertEquals(saveCalled, false);
    assertEquals(callbackState, baseState);
  },
);

Deno.test(
  "solarSaveNode should print failure message and still call onSaveComplete when saveToFile returns false",
  async () => {
    const printed: string[] = [];
    let callbackState: SolarSaveNode.State | undefined;

    const captureNext: Node<SolarSaveNode.State> = (s) => {
      callbackState = s;
      return stop();
    };

    const utils: SolarSaveNode.Utils = {
      readLine: (_msg) => "y",
      saveToFile: async (_content) => await Promise.resolve(false),
      print: (msg) => printed.push(msg),
    };

    const result = await SolarSaveNode.create(
      { onSaveComplete: captureNext },
      utils,
    )(baseState);

    let step = await result();
    while (typeof step === "function") {
      step = await step();
    }
    assertEquals(step, null);
    assertEquals(
      printed.some((m) => m.includes("Failed")),
      true,
    );
    assertEquals(callbackState, baseState);
  },
);
