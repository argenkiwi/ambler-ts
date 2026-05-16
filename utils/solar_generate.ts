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

function buildPrompt(solarPrompt: string): string {
  return `You are an expert narrative engine specialized in the Solarpunk genre. Your task is to take a given "Solar Prompt" and transform it into a richly detailed, emotionally resonant short story that adheres strictly to the core tenets of the Solarpunk movement.

**INPUT:** ${solarPrompt}

**OUTPUT REQUIREMENTS:**
1. **Length:** Approximately 1000–1500 words.
2. **Tone:** Hopeful, resourceful, and slightly melancholy.
3. **Focus:** Sensory detail (smell of clean rain, sound of wind through bio-domes, taste of homegrown food).

**SOLARPUNK NARRATIVE GUIDELINES:**
1. **Community as Protagonist:** Avoid "Chosen One". Focus on teams, neighborhoods, collectives. Success through compromise and collective labor.
2. **Infrastructure is Sexy:** Show the systems (solar power, vertical farms, wastewater). Show the strain/maintenance.
3. **Human/Environmental Harmony:** Conflict should be socio-political or resource-based, not Man vs. Nature. Resolution must demonstrate ingenuity working *with* nature.

**CONCLUSION:**
Conclude with a brief, reflective epilogue (200 words) showing the ongoing reality after the crisis.
`;
}

/**
 * Generates a solarpunk short story from a given prompt using an Ollama model.
 *
 * @param host - Base URL of the Ollama server (e.g. "http://localhost:11434")
 * @param model - Model name to use for generation
 * @param solarPrompt - The solar prompt to transform into a story
 * @returns The generated story text
 */
export async function generateStory(
  host: string,
  model: string,
  solarPrompt: string,
): Promise<string> {
  const response = await getInstance(host).generate({
    model,
    prompt: buildPrompt(solarPrompt),
  });
  return response.response;
}
