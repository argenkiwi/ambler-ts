import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../computerChoice.ts";

Deno.test("computerChoiceNode should select a move and transition to onSuccess", async () => {
  const initialState: State = { cpuMove: null };
  const utils: Utils = {
    randomMove: () => "punch",
  };

  const result = await factory({ onSuccess: "compare" }, utils)(initialState);

  assertEquals(result[0], "compare");
  assertEquals(result[1].cpuMove, "punch");
});
