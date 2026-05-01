import * as SolarPromptNode from "./solarPromptNode.ts";
import { assertEquals } from "@std/assert";

const baseState: SolarPromptNode.State = { solarPrompt: "" };

Deno.test(
  "solarPromptNode should call onCancel when readLine returns null",
  async () => {
    const utils: SolarPromptNode.Utils = {
      readLine: (_msg) => null,
      print: () => {},
    };

    const result = await SolarPromptNode.create(
      { onPromptComplete: "onPromptComplete", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onCancel");
    assertEquals(result[1], baseState);
  },
);

Deno.test(
  "solarPromptNode should set solarPrompt and transition onPromptComplete",
  async () => {
    const utils: SolarPromptNode.Utils = {
      readLine: (_msg) => "A community rebuilds after a storm",
      print: () => {},
    };

    const result = await SolarPromptNode.create(
      { onPromptComplete: "onPromptComplete", onCancel: "onCancel" },
      utils,
    )(baseState);

    assertEquals(result[0], "onPromptComplete");
    assertEquals(
      result[1].solarPrompt,
      "A community rebuilds after a storm",
    );
  },
);
