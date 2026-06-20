import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../llm-check.ts";

Deno.test("llmCheckNode should transition to onSuccess when host is reachable", async () => {
  const initialState: State = { host: "http://localhost:11434" };

  const utils: Utils = {
    checkHost: (_host: string) => Promise.resolve(true),
    getPrompt: (_msg: string) => null,
    print: (_msg: string) => {},
  };

  const result = await factory({ onSuccess: "next", onError: "retry" }, utils)(
    initialState,
  );

  assertEquals(result[0], "next");
  assertEquals(result[1].host, "http://localhost:11434");
});

Deno.test("llmCheckNode should transition to onError with new host when host is unreachable and user provides new one", async () => {
  const initialState: State = { host: "http://wrong:11434" };

  const utils: Utils = {
    checkHost: (host: string) => Promise.resolve(host === "http://right:11434"),
    getPrompt: (_msg: string) => "http://right:11434",
    print: (_msg: string) => {},
  };

  const result = await factory({ onSuccess: "next", onError: "retry" }, utils)(
    initialState,
  );

  assertEquals(result[0], "retry");
  assertEquals(result[1].host, "http://right:11434");
});

Deno.test("llmCheckNode should transition to onError when host is unreachable and user cancels", async () => {
  const initialState: State = { host: "http://wrong:11434" };

  const utils: Utils = {
    checkHost: (_host: string) => Promise.resolve(false),
    getPrompt: (_msg: string) => null,
    print: (_msg: string) => {},
  };

  const result = await factory({ onSuccess: "next", onError: "retry" }, utils)(
    initialState,
  );

  assertEquals(result[0], "retry");
  assertEquals(result[1].host, "http://wrong:11434");
});
