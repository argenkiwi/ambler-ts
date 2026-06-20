/**
 * Sends a conversation history to an OpenAI-compatible API and returns the assistant's response.
 *
 * @param messages - The conversation history.
 * @param model - The model to use.
 * @param host - The OpenAI-compatible API host URL (e.g., http://localhost:11434/v1).
 * @returns The assistant's response content.
 */
export async function llmChat(
  messages: { role: string; content: string }[],
  model: string,
  host: string,
): Promise<string> {
  const url = `${host}/chat/completions`;
  const body = JSON.stringify({
    model,
    messages,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from LLM API: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Error sending request to LLM:
      URL: ${url}
      Body: ${body}
      Error: ${errorMessage}`);
    throw e;
  }
}

/**
 * Checks if the LLM host is reachable.
 * @param host - The LLM host URL (e.g., http://localhost:11434/v1).
 * @returns True if reachable, false otherwise.
 */
export async function checkHost(host: string): Promise<boolean> {
  try {
    const url = host.endsWith("/v1") ? host : `${host}/v1`;
    const response = await fetch(`${url}/models`, {
      method: "GET",
  });
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
  const url = host.endsWith("/v1") ? host : `${host}/v1`;
  const response = await fetch(`${url}/models`);
  if (!response.ok) {
    throw new Error(`Failed to fetch models from LLM API: ${response.statusText}`);
  }
  const data = await response.json();
  // OpenAI API returns data.data.id for models.
  return data.data.map((m: any) => m.id);
}
