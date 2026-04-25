import * as SolarPromptNode from "./solarPromptNode.ts";
import { Node } from "../ambler.ts";
import { assertEquals } from "@std/assert";

const baseState: SolarPromptNode.State = { solarPrompt: "" };

Deno.test(
  "solarPromptNode should return null when readLine returns null",
  () => {
    const utils: SolarPromptNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = SolarPromptNode.create(
      { onPromptComplete: (_s) => null },
      utils,
    )(baseState);

    assertEquals(result, null);
  },
);

Deno.test(
  "solarPromptNode should set solarPrompt and transition onPromptComplete",
  async () => {
    let capturedState: SolarPromptNode.State | undefined;
    const captureNext: Node<SolarPromptNode.State> = (s) => {
      capturedState = s;
      return null;
    };

    const utils: SolarPromptNode.Utils = {
      readLine: (_msg) => "A community rebuilds after a storm",
      print: () => {},
    };

    const result = SolarPromptNode.create(
      { onPromptComplete: captureNext },
      utils,
    )(baseState);

    if (!result) throw new Error("Expected Next, got null");
    await result();

    assertEquals(
      capturedState?.solarPrompt,
      "A community rebuilds after a storm",
    );
  },
);
