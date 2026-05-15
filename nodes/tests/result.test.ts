import { factory, State, Utils } from "../result.ts";
import { assertEquals } from "@std/assert";

Deno.test(
   "resultNode handles jackpot (3 identical) and increases nbPoints",
  async () => {
    const utils: Utils = {
      print: () => {},
     };

    const initialState: State = {
      nbPoints: 200,
      bet: 50,
      symbols: ["🍒", "🍒", "🍒"],
     };
    const result = await factory({
      onBet: "bet",
      onGameOver: "gameOver",
     }, utils)(initialState);

     assertEquals(result[0], "bet");
     assertEquals(result[1].nbPoints, 700); // 200 + (50 * 10)
   },
);

Deno.test(
   "resultNode handles two identical and increases nbPoints",
  async () => {
    const utils: Utils = {
      print: () => {},
     };

    const initialState: State = {
      nbPoints: 200,
      bet: 30,
      symbols: ["🍋", "🍋", "🍊"],
     };
    const result = await factory({
      onBet: "bet",
      onGameOver: "gameOver",
     }, utils)(initialState);

     assertEquals(result[0], "bet");
     assertEquals(result[1].nbPoints, 260); // 200 + (30 * 2)
   },
);

Deno.test(
   "resultNode handles nothing matched and decreases nbPoints",
  async () => {
    const utils: Utils = {
      print: () => {},
     };

    const initialState: State = {
      nbPoints: 200,
      bet: 50,
      symbols: ["🍒", "🍋", "🍊"],
     };
    const result = await factory({
      onBet: "bet",
      onGameOver: "gameOver",
     }, utils)(initialState);

     assertEquals(result[0], "bet");
     assertEquals(result[1].nbPoints, 150); // 200 - 50
   },
);

Deno.test(
   "resultNode transitions to onGameOver when nbPoints reaches 0",
  async () => {
    const utils: Utils = {
      print: () => {},
     };

    const initialState: State = {
      nbPoints: 10,
      bet: 10,
      symbols: ["🍒", "🍋", "🍊"],
     };
    const result = await factory({
      onBet: "bet",
      onGameOver: "gameOver",
     }, utils)(initialState);

     assertEquals(result[0], "gameOver");
     assertEquals(result[1].nbPoints, 0); // 10 - 10
   },
);

Deno.test(
   "resultNode transitions to onBet even after jackpot when nbPoints stays positive",
  async () => {
    const utils: Utils = {
      print: () => {},
     };

    const initialState: State = {
      nbPoints: 200,
      bet: 100,
      symbols: ["⭐", "⭐", "⭐"],
     };
    const result = await factory({
      onBet: "bet",
      onGameOver: "gameOver",
     }, utils)(initialState);

     assertEquals(result[0], "bet");
     assertEquals(result[1].nbPoints, 1200); // 200 + (100 * 10)
   },
);
