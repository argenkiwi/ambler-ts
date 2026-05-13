import { assertEquals, assertNotEquals } from "@std/assert";
import { transpose } from "../troll.ts";

Deno.test("transpose should preserve 1 and 2 letter words", () => {
  assertEquals(transpose("a"), "a");
  assertEquals(transpose("is"), "is");
  assertEquals(transpose("I am"), "I am");
});

Deno.test("transpose should preserve first and last letters of longer words", () => {
  const input = "scramble";
  const result = transpose(input);
  assertEquals(result.length, input.length);
  assertEquals(result[0], input[0]);
  assertEquals(result[result.length - 1], input[input.length - 1]);
});

Deno.test("transpose should contain the same characters as the input", () => {
  const input = "alphabetical";
  const result = transpose(input);
  
  const sortString = (s: string) => s.split("").sort().join("");
  assertEquals(sortString(result), sortString(input));
});

Deno.test("transpose should scramble middle characters (statistically likely for long words)", () => {
  const input = "extremelylongwordthatshouldbescrambled";
  // We run it a few times to be sure, as randomness could theoretically result in same string
  let scrambled = false;
  for (let i = 0; i < 10; i++) {
    if (transpose(input) !== input) {
      scrambled = true;
      break;
    }
  }
  assertEquals(scrambled, true);
});

Deno.test("transpose should handle multiple words and punctuation", () => {
  const input = "Hello world! This is a test.";
  const result = transpose(input);
  
  // "a", "is" should be unchanged
  // "This" should have T...s
  // "test" should have t...t
  // "Hello" should have H...o
  // "world" should have w...d
  
  const words = result.split(/[^a-zA-Z]+/);
  assertEquals(words.length, 7); // Hello, world, This, is, a, test, and empty string at end
  
  assertEquals(result.includes("!"), true);
  assertEquals(result.includes("."), true);
});
