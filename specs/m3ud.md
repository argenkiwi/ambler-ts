# Program Specifications

This program downloads audio files specified in an M3U playlist. It takes an M3U file path as a command-line argument, optionally resolves `khinsider.com` URLs to direct download links, then downloads all files to a local folder.

## Shared State

- `m3uFilePath`: The path to the M3U file being processed.
- `urls`: The list of URLs extracted from or written to the M3U file.

## Steps

### Check M3U File
- This is the initial step of the application.
- Reads the file path from the first command-line argument.
- If no path is provided, or if the path does not have a `.m3u` extension, or if the file does not exist or is not a regular file, prints an error and terminates.
- If valid, stores the path in state and proceeds to `READ_M3U_FILE`.

### Read M3U File
- Reads the M3U file at `state.m3uFilePath`.
- Parses each line, ignoring empty lines and comment lines (starting with `#`).
- Stores the extracted URLs in state and prints them.
- If any URL starts with `https://downloads.khinsider.com/game-soundtracks`, proceeds to `PROMPT_RESOLVE`.
- Otherwise, proceeds to `PROMPT_DOWNLOAD`.

### Prompt Resolve
- Displays: `Some URLs require resolution. Proceed? (y/n)`.
- Loops until the user enters `y`/`yes` or `n`/`no`.
- If `y`/`yes`, proceeds to `RESOLVE_URLS`.
- If `n`/`no`, terminates.

### Resolve URLs
- For each URL in state: if it is a khinsider URL, calls `resolveKhinsiderUrl` to obtain the direct download link; otherwise keeps it as-is.
- All resolutions run in parallel.
- Updates state with the resolved URLs and proceeds to `SAVE_M3U_FILE`.

### Save M3U File
- Joins `state.urls` with newlines and overwrites `state.m3uFilePath`.
- Prints the saved file path and the current URL list.
- Proceeds to `onSuccess`, which is either `PROMPT_DOWNLOAD` (after resolve) or terminates (after download).

### Prompt Download
- Displays: `Proceed with download? (y/n)`.
- Loops until the user enters `y`/`yes` or `n`/`no`.
- If `y`/`yes`, proceeds to `DOWNLOAD_FILES`.
- If `n`/`no`, terminates.

### Download Files
- Derives the output folder name from the M3U filename (without extension).
- Downloads all URLs in `state.urls` to the output folder in parallel.
- Removes the original M3U file.
- Updates state with `m3uFilePath` set to `<outputFolder>/playlist.m3u` and `urls` replaced with `file://` URIs of the downloaded files.
- Proceeds to `SAVE_M3U_FILE`, which saves the local playlist and then terminates.
