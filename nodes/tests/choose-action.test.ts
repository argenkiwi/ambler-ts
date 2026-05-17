import { factory, State, Utils } from "../choose-action.ts";
import { assertEquals } from "@std/assert";

const baseState: State = {
  csv_path: "/tmp/test.csv",
  has_header: true,
  header: ["name", "age"],
  data: [["Alice", "30"]],
};

function makeUtils(choice: string): Utils {
  return {
    readLine: (_msg) => choice,
    print: () => {},
  };
}

for (const [choice, edge] of [
  ["add", "add"],
  ["reorder", "reorder"],
  ["list", "list"],
  ["quit", "quit"],
]) {
  Deno.test(
    `chooseActionNode should transition to '${edge}' when user chooses '${choice}'`,
    async () => {
      const result = factory(
        {
          add: "ADD",
          reorder: "REORDER",
          list: "LIST",
          quit: "END",
        },
        makeUtils(choice),
      )(baseState);
      const expectedEdge = edge === "add" ? "ADD" :
        edge === "reorder" ? "REORDER" :
        edge === "list" ? "LIST" : "END";
      assertEquals(result[0], expectedEdge);
    },
  );
}

Deno.test(
  "chooseActionNode should transition to quit on unknown input",
  async () => {
    const result = factory(
      {
        add: "ADD",
        reorder: "REORDER",
        list: "LIST",
        quit: "END",
      },
      makeUtils("zoom"),
    )(baseState);
    assertEquals(result[0], "END");
  },
);
