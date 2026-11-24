import { expect, test } from "bun:test";
import { factory } from "../scaffold-util.ts";
import { fakeFs } from "./fake-fs.ts";

const edges = { onDone: "DONE", onError: "ERROR" };

test("scaffoldUtil writes utils/<kebab-name>.ts and transitions to onDone", async () => {
  const fs = fakeFs();
  const [next] = await factory(
    edges,
    fs.utils,
  )({
    argv: ["myHelper"],
    exitCode: 0,
  });
  expect(next).toBe("DONE");
  expect(fs.files.get("utils/my-helper.ts")).toContain("MyHelperUtils");
});

test("scaffoldUtil requires a name (exit code 2)", async () => {
  const fs = fakeFs();
  const [next, state] = await factory(
    edges,
    fs.utils,
  )({
    argv: [],
    exitCode: 0,
  });
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(2);
});

test("scaffoldUtil refuses to overwrite an existing util (exit code 1)", async () => {
  const fs = fakeFs({ "utils/x.ts": "old" });
  const [next, state] = await factory(
    edges,
    fs.utils,
  )({
    argv: ["x"],
    exitCode: 0,
  });
  expect(next).toBe("ERROR");
  expect(state.exitCode).toBe(1);
  expect(fs.files.get("utils/x.ts")).toBe("old");
});
