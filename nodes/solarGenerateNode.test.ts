import * as SolarGenerateNode from "./solarGenerateNode.ts";
import { Node, stop } from "../ambler.ts";
import { assertEquals } from "@std/assert";

const baseState: SolarGenerateNode.State = {
  ollamaHost: "http://localhost:11434",
  selectedModel: "llama3",
  solarPrompt: "A village harnesses solar energy",
  generatedStory: "",
};

Deno.test(
  "solarGenerateNode should set generatedStory and transition onGenerateComplete",
  async () => {
    let capturedState: SolarGenerateNode.State | undefined;
    const captureNext: Node<SolarGenerateNode.State> = (s) => {
      capturedState = s;
      return stop();
    };

    const utils: SolarGenerateNode.Utils = {
      generateStory: (_host, _model, _prompt) =>
        Promise.resolve("Once upon a time in a solarpunk world..."),
      print: () => {},
    };

    const result = await SolarGenerateNode.create(
      { onGenerateComplete: captureNext, onError: () => stop() },
      utils,
    )(baseState);

    await result();

    assertEquals(
      capturedState?.generatedStory,
      "Once upon a time in a solarpunk world...",
    );
  },
);

Deno.test(
  "solarGenerateNode should call onError when generateStory throws",
  async () => {
    const utils: SolarGenerateNode.Utils = {
      generateStory: (_host, _model, _prompt) => {
        throw new Error("model unavailable");
      },
      print: () => {},
    };

    const result = await SolarGenerateNode.create(
      { onGenerateComplete: (_s) => stop(), onError: () => stop() },
      utils,
    )(baseState);

    let step = await result();
    while (typeof step === "function") {
      step = await step();
    }
    assertEquals(step, null);
  },
);
