/**
 * Normalises an OpenAI-compatible host to its `/v1` base URL.
 *
 * @param host - e.g. `http://localhost:11434` or `http://localhost:11434/v1/`.
 * @returns The base URL ending in `/v1`, without a trailing slash.
 */
export function baseUrl(host: string): string {
  const trimmed = host.replace(/\/+$/, "");
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

/**
 * Sends a conversation history to an OpenAI-compatible API and returns the assistant's response.
 *
 * @param messages - The conversation history.
 * @param model - The model to use.
 * @param host - The OpenAI-compatible API host URL (e.g., http://localhost:11434/v1).
 * @returns The assistant's response content.
 * @throws {Error} If the request fails or the response is not OK.
 */
export async function llmChat(
  messages: { role: string; content: string }[],
  model: string,
  host: string,
): Promise<string> {
  const url = `${baseUrl(host)}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    // The request body (the whole conversation) is deliberately not logged.
    throw new Error(
      `LLM request to ${url} failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: { choices: { message: { content: string } }[] } = await response
    .json();
  return data.choices[0].message.content;
}

/**
 * Checks if the LLM host is reachable.
 * @param host - The LLM host URL (e.g., http://localhost:11434/v1).
 * @returns True if reachable, false otherwise.
 */
export async function checkHost(host: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl(host)}/models`, { method: "GET" });
    await response.body?.cancel();
    return response.ok;
  } catch (_e) {
    return false;
  }
}

/**
 * Lists available models from the LLM host.
 * @param host - The LLM host URL (e.g., http://localhost:11434/v1).
 * @returns A list of model names.
 */
export async function listModels(host: string): Promise<string[]> {
  const response = await fetch(`${baseUrl(host)}/models`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch models from LLM API: ${response.statusText}`,
    );
  }
  // OpenAI API returns { data: [{ id }] }.
  const data: { data: { id: string }[] } = await response.json();
  return data.data.map((m) => m.id);
}
