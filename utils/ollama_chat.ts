import { Ollama } from "ollama";

export const DEFAULT_HOST = "http://localhost:11434";
export const DEFAULT_MODEL = "llama3";

/**
 * Sends a conversation history to Ollama and returns the assistant's response.
 *
 * @param messages - The conversation history.
 * @param model - The Ollama model to use (defaults to llama3).
 * @param host - The Ollama host URL (defaults to http://localhost:11434).
 * @returns The assistant's response content.
 */
export async function ollamaChat(
  messages: { role: string; content: string }[],
  model: string = DEFAULT_MODEL,
  host: string = DEFAULT_HOST,
): Promise<string> {
  const ollama = new Ollama({ host });
  const response = await ollama.chat({
    model,
    messages,
  });
  return response.message.content;
}

/**
 * Checks if the Ollama host is reachable.
 * @param host - The Ollama host URL.
 * @returns True if reachable, false otherwise.
 */
export async function checkHost(host: string): Promise<boolean> {
  try {
    const ollama = new Ollama({ host });
    await ollama.list();
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Lists available models from the Ollama host.
 * @param host - The Ollama host URL.
 * @returns A list of model names.
 */
export async function listModels(host: string): Promise<string[]> {
  const ollama = new Ollama({ host });
  const response = await ollama.list();
  return response.models.map((m) => m.name);
}
