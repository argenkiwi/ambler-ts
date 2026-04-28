import { Ollama } from "npm:ollama";

const ollamaInstances = new Map<string, Ollama>();

/**
 * Sends a chat request to an Ollama server and returns the assistant's reply.
 *
 * @param host - Base URL of the Ollama server (e.g. "http://localhost:11434")
 * @param model - Model name to use
 * @param messages - Conversation history in role/content format
 * @returns The assistant's response text
 */
export async function ollamaChat(
  host: string,
  model: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  let ollama = ollamaInstances.get(host);

  if (!ollama) {
    ollama = new Ollama({ host });
    ollamaInstances.set(host, ollama);
  }

  const response = await ollama.chat({ model, messages });
  return response.message.content;
}
