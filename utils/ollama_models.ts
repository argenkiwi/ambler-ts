import { Ollama } from "ollama";

const instances = new Map<string, Ollama>();

function getInstance(host: string): Ollama {
  let ollama = instances.get(host);
  if (!ollama) {
    ollama = new Ollama({ host });
    instances.set(host, ollama);
  }
  return ollama;
}

/**
 * Lists the names of all models available on an Ollama server.
 *
 * @param host - Base URL of the Ollama server (e.g. "http://localhost:11434")
 * @returns Array of model name strings
 */
export async function listModels(host: string): Promise<string[]> {
  const response = await getInstance(host).list();
  return response.models.map((m) => m.name);
}
