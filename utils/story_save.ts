import fs from "node:fs/promises";

const OUTPUT_DIR = "cyoa";

/**
 * Saves story content to a Markdown file in the cyoa/ directory, creating it if needed.
 *
 * @param filename - Base filename without extension (e.g. "story-2026-04-29")
 * @param content - Markdown content to write
 */
export async function saveFile(
  filename: string,
  content: string,
): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(`${OUTPUT_DIR}/${filename}.md`, content);
}
