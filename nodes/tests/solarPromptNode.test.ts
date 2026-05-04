import { factory, State, Utils } from "../solarPromptNode.ts";
import { assertEquals } from "@std/assert";

const baseState: State = { solarPrompt: "" };

Deno.test(
  "solarPromptNode should call onCancel when readLine returns null",
  async () => {
    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = await factory(
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
    const utils: Utils = {
      readLine: (_msg: string) => "A community rebuilds after a storm",
      print: (_msg: string) => {},
    };

    const result = await factory(
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
