import * as SolarPromptNode from "./solarPromptNode.ts";
import { Node, stop } from "../ambler.ts";
import { assertEquals } from "@std/assert";

const baseState: SolarPromptNode.State = { solarPrompt: "" };

Deno.test(
  "solarPromptNode should call onCancel when readLine returns null",
  async () => {
    const utils: SolarPromptNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = SolarPromptNode.create(
      { onPromptComplete: (_s) => stop(), onCancel: () => stop() },
      utils,
    )(baseState);

    let step = await result();
    while (typeof step === "function") {
      step = await step();
    }
    assertEquals(step, null);
  },
);

Deno.test(
  "solarPromptNode should set solarPrompt and transition onPromptComplete",
  async () => {
    let capturedState: SolarPromptNode.State | undefined;
    const captureNext: Node<SolarPromptNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const utils: SolarPromptNode.Utils = {
      readLine: (_msg) => "A community rebuilds after a storm",
      print: () => {},
    };

    const result = SolarPromptNode.create(
      { onPromptComplete: captureNext, onCancel: () => stop() },
      utils,
    )(baseState);

    await (await result)();

    assertEquals(
      capturedState?.solarPrompt,
      "A community rebuilds after a storm",
    );
  },
);
