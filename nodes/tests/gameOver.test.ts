import { factory, State, Utils } from "../gameOver.ts";
import { assertEquals } from "@std/assert";

Deno.test(
   "gameOverNode returns onDone (null) and prints final score",
  async () => {
    let capturedMessage: string | undefined;
    const utils: Utils = {
      print: (msg: string) => { capturedMessage = msg; },
     };

    const initialState: State = { nbPoints: 50, bet: 0, symbols: [] };
    const result = await factory(
       { onDone: null },
      utils,
     )(initialState);

     assertEquals(result[0], null);
     assertEquals(result[1].nbPoints, 50);
     assertEquals(capturedMessage, "\nGame Over! Your final score: 50 points.");
   },
);
