import { Ollama } from "npm:ollama";

const ollamaInstances = new Map<string, Ollama>();

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
