/**
 * Writes content to a timestamped Markdown file in the current directory.
 *
 * @param content - Text content to write
 * @returns The generated filename on success
 */
export async function saveToFile(content: string): Promise<string> {
  const filename = `story-${Date.now()}.md`;
  await Deno.writeTextFile(filename, content);
  return filename;
}
