export async function downloadFile(
  url: string,
  outputFolder: string,
): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }

    const filename = url.substring(url.lastIndexOf("/") + 1);
    const outputPath = `${outputFolder}/${filename}`;

    await Deno.mkdir(outputFolder, { recursive: true });
    await Deno.writeFile(
      outputPath,
      new Uint8Array(await response.arrayBuffer()),
    );
    console.log(`Downloaded: ${filename} to ${outputFolder}`);
  } catch (error) {
    console.error(`Error downloading ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
