/**
 * Reads and parses a single JSON object from stdin.
 *
 * @returns The parsed JSON value.
 */
export async function readStdinJson<T>(): Promise<T> {
  const text = await new Response(Deno.stdin.readable).text();
  return JSON.parse(text) as T;
}
