import { factory, State, Utils } from "../spin.ts";
import { assertEquals } from "@std/assert";

Deno.test(
   "spinNode generates 3 symbols and transitions to onResult",
  async () => {
    let printCount = 0;
    const utils: Utils = {
      print: () => { printCount++; },
      sleep: async () => {},
      random: () => 0.3,
     };

    const initialState: State = { nbPoints: 200, bet: 20, symbols: [] };
    const result = await factory(
       { onResult: "result" },
      utils,
     )(initialState);

     assertEquals(result[0], "result");
     assertEquals(result[1].nbPoints, 200);
     assertEquals(result[1].bet, 20);
     assertEquals(result[1].symbols.length, 3);
   },
);

Deno.test(
   "spinNode returns from the SYMBOLS range",
  async () => {
    const utils: Utils = {
      print: () => {},
      sleep: async () => {},
      random: () => 0.9,
     };

    const initialState: State = { nbPoints: 200, bet: 10, symbols: [] };
    const result = await factory(
       { onResult: "result" },
      utils,
     )(initialState);

     const symbols = result[1].symbols as string[];
     assertEquals(symbols.length, 3);
     for (const sym of symbols) {
       assertEquals(typeof sym, "string");
       assertEquals(sym.length > 0, true);
      }
   },
);
