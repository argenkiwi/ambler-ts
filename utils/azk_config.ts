/** Directory (relative to the project root) where note Markdown files live. */
export const NOTES_DIR = "notes";

/** Path (relative to the project root) to the derived SQLite search/link index. */
export const DB_PATH = ".azk/azk.db";

/**
 * Path to a note's Markdown file on disk.
 *
 * @param id - The note's unique id.
 */
export function notePath(id: string): string {
  return `${NOTES_DIR}/${id}.md`;
}
