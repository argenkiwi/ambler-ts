const TIMEOUT_MS = 2000;

/**
 * Checks whether an Ollama server is reachable at the given host URL.
 *
 * @param host - Base URL to probe (e.g. "http://localhost:11434")
 * @returns true if the server responds with a successful status within the timeout
 */
export async function tryHost(host: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(`${host}/api/version`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}
