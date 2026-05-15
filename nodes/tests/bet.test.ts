import { factory, State, Utils } from "../bet.ts";
import { assertEquals } from "@std/assert";

Deno.test("betNode transitions to onSpin with a valid bet", async () => {
  const utils: Utils = {
    readLine: () => "50",
    print: () => {},
   };

  const initialState: State = { nbPoints: 200, bet: 0, symbols: [] };
  const result = await factory({
    onSpin: "spin",
    onInvalid: "bet",
    onGameOver: "gameOver",
   }, utils)(initialState);

   assertEquals(result[0], "spin");
   assertEquals(result[1].nbPoints, 200);
   assertEquals(result[1].bet, 50);
});

Deno.test("betNode transitions to onInvalid when bet exceeds points", async () => {
  const utils: Utils = {
    readLine: () => "300",
    print: () => {},
   };

  const initialState: State = { nbPoints: 200, bet: 0, symbols: [] };
  const result = await factory({
    onSpin: "spin",
    onInvalid: "bet",
    onGameOver: "gameOver",
   }, utils)(initialState);

   assertEquals(result[0], "bet");
   assertEquals(result[1].nbPoints, 200);
});

Deno.test("betNode transitions to onGameOver when bet is 0", async () => {
  const utils: Utils = {
    readLine: () => "0",
    print: () => {},
   };

  const initialState: State = { nbPoints: 200, bet: 0, symbols: [] };
  const result = await factory({
    onSpin: "spin",
    onInvalid: "bet",
    onGameOver: "gameOver",
   }, utils)(initialState);

   assertEquals(result[0], "gameOver");
});

Deno.test("betNode transitions to onInvalid on non-number input", async () => {
  const utils: Utils = {
    readLine: () => "abc",
    print: () => {},
   };

  const initialState: State = { nbPoints: 200, bet: 0, symbols: [] };
  const result = await factory({
    onSpin: "spin",
    onInvalid: "bet",
    onGameOver: "gameOver",
   }, utils)(initialState);

   assertEquals(result[0], "bet");
   assertEquals(result[1].nbPoints, 200);
});
