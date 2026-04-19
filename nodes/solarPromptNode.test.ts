import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import * as SolarPromptNode from "./solarPromptNode.ts";
import { Nextable } from "../ambler.ts";

const baseState: SolarPromptNode.State = { solarPrompt: "" };

Deno.test(
  "solarPromptNode should return null when readLine returns null",
  async () => {
    const utils: SolarPromptNode.Utils = {
      readLine: async (_msg) => null,
      print: () => {},
    };

    const result = await SolarPromptNode.create(
      { onPromptComplete: async (_s) => null },
      utils,
    )(baseState);

    assertEquals(result, null);
  },
);

Deno.test(
  "solarPromptNode should set solarPrompt and transition onPromptComplete",
  async () => {
    let capturedState: SolarPromptNode.State | undefined;
    const captureNext: Nextable<SolarPromptNode.State> = async (s) => {
      capturedState = s;
      return null;
    };

    const utils: SolarPromptNode.Utils = {
      readLine: async (_msg) => "A community rebuilds after a storm",
      print: () => {},
    };

    const result = await SolarPromptNode.create(
      { onPromptComplete: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result.run();

    assertEquals(
      capturedState?.solarPrompt,
      "A community rebuilds after a storm",
    );
  },
);
