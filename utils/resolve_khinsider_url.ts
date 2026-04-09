export async function resolveKhinsiderUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const match = html.match(/href="(https?:\/\/[^"]+\.mp3)"/i);
  if (!match) {
    throw new Error(`Could not resolve direct download URL from: ${url}`);
  }
  return match[1];
}
