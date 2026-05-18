import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../clone-config.ts";

function makeUtils(targetContent: string, sourceContent = ""): Utils & { written: Record<string, string> } {
  const written: Record<string, string> = {};
  return {
    written,
    readTextFile: async (path: string) => {
      if (path.includes("/deno.json") && !path.startsWith("/source")) return targetContent;
      if (path.startsWith("/source")) return sourceContent;
      throw new Error(`Unexpected read: ${path}`);
    },
    writeTextFile: async (path: string, data: string) => {
      written[path] = data;
    },
  };
}

Deno.test("cloneConfigNode adds walk task with default command when source has no task entry", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "my-walk",
    artifactType: "walk",
  };

  const utils = makeUtils(
    JSON.stringify({ imports: { "@std/assert": "jsr:@std/assert@^1.0.19" } }),
    JSON.stringify({}),
  );

  const result = await factory({ onSuccess: "STOP", onError: "STOP" }, utils)(initialState);

  assertEquals(result[0], "STOP");
  const written = JSON.parse(utils.written["/target/deno.json"]);
  assertEquals(written.tasks["my-walk"], "deno run --allow-read --allow-write walks/my-walk.ts");
  assertEquals(written.imports["@std/assert"], "jsr:@std/assert@^1.0.19");
});

Deno.test("cloneConfigNode copies task from source deno.json when present", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "my-walk",
    artifactType: "walk",
  };

  const utils = makeUtils(
    JSON.stringify({}),
    JSON.stringify({ tasks: { "my-walk": "deno run walks/my-walk.ts" } }),
  );

  const result = await factory({ onSuccess: "STOP", onError: "STOP" }, utils)(initialState);

  assertEquals(result[0], "STOP");
  const written = JSON.parse(utils.written["/target/deno.json"]);
  assertEquals(written.tasks["my-walk"], "deno run walks/my-walk.ts");
});

Deno.test("cloneConfigNode adds external deps when externalDeps is populated", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "my-util",
    artifactType: "util",
    externalDeps: { "ollama": "npm:ollama@^0.6.3" },
  };

  const utils = makeUtils(
    JSON.stringify({ imports: { "@std/assert": "jsr:@std/assert@^1.0.19" } }),
  );

  const result = await factory({ onSuccess: "STOP", onError: "STOP" }, utils)(initialState);

  assertEquals(result[0], "STOP");
  const written = JSON.parse(utils.written["/target/deno.json"]);
  assertEquals(written.imports["ollama"], "npm:ollama@^0.6.3");
  assertEquals(written.imports["@std/assert"], "jsr:@std/assert@^1.0.19");
  assertEquals(written.tasks, undefined);
});

Deno.test("cloneConfigNode skips task creation for artifactType node", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "my-node",
    artifactType: "node",
    externalDeps: {},
  };

  const utils = makeUtils(JSON.stringify({}));

  const result = await factory({ onSuccess: "STOP", onError: "STOP" }, utils)(initialState);

  assertEquals(result[0], "STOP");
  assertEquals(utils.written["/target/deno.json"], undefined);
});

Deno.test("cloneConfigNode is a no-op when artifactType is node with no external deps", async () => {
  const initialState: State = {
    targetDir: "/target",
    sourceRoot: "/source",
    walkName: "plain-node",
    artifactType: "node",
  };

  const utils = makeUtils(JSON.stringify({ tasks: { "existing": "deno run walks/existing.ts" } }));

  const result = await factory({ onSuccess: "STOP", onError: "STOP" }, utils)(initialState);

  assertEquals(result[0], "STOP");
  assertEquals(utils.written["/target/deno.json"], undefined);
});
