const BASE_URL = "http://localhost:11434";

export async function listModels(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/api/tags`);
  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return (data.models as Array<{ name: string }>).map((m) => m.name);
}

export async function chat(model: string, prompt: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });
  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.response as string;
}
