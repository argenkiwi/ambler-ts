/**
 * OpenAI-compatible host for a local embeddings-capable server (e.g. Ollama).
 * Overridable via the `EMBEDDING_HOST` environment variable (e.g. in a `.env` file).
 */
export const DEFAULT_EMBEDDING_HOST = Deno.env.get("EMBEDDING_HOST") ??
  "http://localhost:11434/v1";

/**
 * Embedding model name, assumed pulled on the configured host.
 * Overridable via the `EMBEDDING_MODEL` environment variable (e.g. in a `.env` file).
 */
export const DEFAULT_EMBEDDING_MODEL = Deno.env.get("EMBEDDING_MODEL") ??
  "embeddinggemma:latest";

/**
 * Embeds text using an OpenAI-compatible embeddings endpoint (e.g. Ollama/LM Studio).
 * Never throws on an unreachable host or missing model — callers treat a `null`
 * result as "no semantic search available", degrading gracefully to keyword search.
 *
 * @param text - The text to embed.
 * @param model - The embedding model to use (e.g. "nomic-embed-text").
 * @param host - The OpenAI-compatible API host URL (e.g. http://localhost:11434/v1).
 * @returns The embedding vector, or `null` if the host is unreachable or errored.
 */
export async function embed(
  text: string,
  model: string,
  host: string,
): Promise<number[] | null> {
  try {
    const response = await fetch(`${host}/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: text }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

/**
 * Computes the cosine similarity between two vectors of equal length.
 *
 * @param a - The first vector.
 * @param b - The second vector.
 * @returns A value in [-1, 1], where 1 means identical direction.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
