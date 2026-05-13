/**
 * Scrambles the internal letters of each word while preserving the first and last letters.
 * A word is defined as a sequence of word characters (\w) of length 3 or more.
 * This mimics the algorithm: perl -ne's/(\w)(\w+)(\w)\b/"$1".(join"",sort{(rand)<=>0.7}split//,$2).$3/gex&&print;'
 *
 * @param text - The text to scramble.
 * @returns The text with internal letters of words scrambled.
 */
export function transpose(text: string): string {
  return text.replace(/(\w)(\w+)(\w)\b/g, (_match, p1, p2, p3) => {
    const middle = p2.split("").sort(() => Math.random() - 0.7).join("");
    return p1 + middle + p3;
  });
}
