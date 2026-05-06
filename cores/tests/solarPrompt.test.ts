import { factory, Utils } from "../solarPrompt.ts";
import { assertEquals } from "@std/assert";

Deno.test(
  "solarPromptNode should call onCancel when readLine returns null",
  () => {
    const utils: Utils = {
      readLine: (_msg: string) => null,
      print: (_msg: string) => {},
    };

    const result = factory(
      { onPromptComplete: "onPromptComplete", onCancel: "onCancel" },
      utils,
    )();

    assertEquals(result[0], "onCancel");
    assertEquals(result[1], "");
  },
);

Deno.test(
  "solarPromptNode should set solarPrompt and transition onPromptComplete",
  () => {
    const utils: Utils = {
      readLine: (_msg: string) => "A community rebuilds after a storm",
      print: (_msg: string) => {},
    };

    const result = factory(
      { onPromptComplete: "onPromptComplete", onCancel: "onCancel" },
      utils,
    )();

    assertEquals(result[0], "onPromptComplete");
    assertEquals(
      result[1],
      "A community rebuilds after a storm",
    );
  },
);
