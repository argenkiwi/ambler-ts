/**
 * Writes content to a timestamped Markdown file in the current directory.
 *
 * @param content - Text content to write
 * @returns true on success, false if the write fails
 */
export async function saveToFile(content: string): Promise<boolean> {
  const filename = `story-${Date.now()}.md`;
  try {
    await Deno.writeTextFile(filename, content);
    console.log(`Saved to ${filename}`);
    return true;
  } catch (e) {
    console.error(`Failed to save: ${e}`);
    return false;
  }
}
