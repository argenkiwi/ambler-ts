import { basename } from "https://deno.land/std@0.224.0/path/mod.ts";

export async function downloadFile(url: string, folder: string): Promise<string> {
  await Deno.mkdir(folder, { recursive: true });
  const filename = basename(new URL(url).pathname);
  const destPath = `${folder}/${filename}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  const data = await response.arrayBuffer();
  await Deno.writeFile(destPath, new Uint8Array(data));
  return destPath;
}
