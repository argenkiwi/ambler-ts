import { basename } from "node:path";

/**
 * Downloads a file from a URL to a specified local folder.
 *
 * @param url - The URL of the file to download
 * @param folder - The local directory where the file will be saved
 * @returns The absolute path to the downloaded file
 */
export async function downloadFile(
  url: string,
  folder: string,
): Promise<string> {
  await Deno.mkdir(folder, { recursive: true });
  const filename = basename(new URL(url).pathname);
  const destPath = `${folder}/${filename}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${url}: ${response.status} ${response.statusText}`,
    );
  }
  const data = await response.arrayBuffer();
  await Deno.writeFile(destPath, new Uint8Array(data));
  return destPath;
}
