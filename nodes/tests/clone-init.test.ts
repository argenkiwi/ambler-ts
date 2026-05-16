import { assertEquals } from "@std/assert";
import { factory, State } from "../clone-init.ts";

Deno.test("cloneInitNode should transition to onNewProject when isNewProject is true", async () => {
  const initialState: State = {
    isNewProject: true,
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "COPY" },
  )(initialState);

  assertEquals(result[0], "INIT_SETUP");
});

Deno.test("cloneInitNode should transition to onExisting when isNewProject is false", async () => {
  const initialState: State = {
    isNewProject: false,
  };

  const result = await factory(
    { onNewProject: "INIT_SETUP", onExisting: "COPY" },
  )(initialState);

  assertEquals(result[0], "COPY");
});
