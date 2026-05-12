/**
 * Prompts the user for input via the terminal.
 *
 * @param message - The message to display to the user.
 * @returns The user's input, or null if cancelled (e.g. Ctrl+D).
 */
export function getPrompt(message: string): string | null {
  return prompt(message);
}
