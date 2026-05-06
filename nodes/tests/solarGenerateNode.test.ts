import { factory, Input, Utils } from "../solarGenerateNode.ts";
import { assertEquals } from "@std/assert";

const input: Input = {
  ollamaHost: "http://localhost:11434",
  selectedModel: "llama3",
  solarPrompt: "A village harnesses solar energy",
};

Deno.test(
  "solarGenerateNode should set generatedStory and transition onGenerateComplete",
  async () => {
    const utils: Utils = {
      generateStory: (_host: string, _model: string, _prompt: string) =>
        Promise.resolve("Once upon a time in a solarpunk world..."),
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onGenerateComplete: "onGenerateComplete", onError: "onError" },
      utils,
    )(input);

    assertEquals(result[0], "onGenerateComplete");
    assertEquals(
      result[1].generatedStory,
      "Once upon a time in a solarpunk world...",
    );
  },
);

Deno.test(
  "solarGenerateNode should call onError when generateStory throws",
  async () => {
    const utils: Utils = {
      generateStory: (_host: string, _model: string, _prompt: string) => {
        throw new Error("model unavailable");
      },
      print: (_msg: string) => {},
    };

    const result = await factory(
      { onGenerateComplete: "onGenerateComplete", onError: "onError" },
      utils,
    )(input);

    assertEquals(result[0], "onError");
    assertEquals(result[1].generatedStory, "");
  },
);
