
# Program Specifications

This program downloads audio files specified in an M3U playlist. It accepts an M3U file path as a command-line argument or prompts the user for one, then offers options to list URLs, resolve `khinsider.com` URLs to direct download links, or download all files.

## Shared State

The shared state holds the M3U file path and the list of URLs extracted from it.

## Steps

### Check M3U File
- This is the initial step.
- Checks whether an M3U file path was provided as a command-line argument; if so, validates that the path exists, is a file, and has a `.m3u` extension.
- If the path is valid, stores it in state and proceeds to `READ_M3U_FILE`.
- If the path is missing or invalid, proceeds to `PROMPT_M3U_FILE`.

### Prompt M3U File
- Prompts the user to enter a path to an M3U file.
- If the user leaves the input empty, the program terminates.
- Otherwise, stores the entered path in state and proceeds to `CHECK_M3U_FILE`.

### Read M3U File
- Reads the M3U file at the path stored in state and parses it to extract all valid URLs, ignoring comments and blank lines.
- Stores the extracted URL list in state.
- Proceeds to `PROMPT_OPTIONS`.

### Prompt Options
- Presents available actions based on the URLs in state: `list` (always available); `resolve` (available only when at least one URL starts with `https://downloads.khinsider.com/game-soundtracks`); `download` (available when `resolve` is not); and `quit` (always available).
- Prompts the user to select an action by number.
- Proceeds to `LIST_URLS`, `RESOLVE_URLS`, or `DOWNLOAD_FILES` according to the selection, or terminates the program if `quit` is chosen.

### List Urls
- Prints each URL currently stored in state to the console.
- Proceeds to `PROMPT_OPTIONS`.

### Resolve Urls
- For each `khinsider.com` URL in state, fetches the corresponding direct download link (calls may run in parallel).
- Replaces the original URLs in state with the resolved direct download links.
- Proceeds to `SAVE_M3U_FILE`.

### Save M3U File
- Overwrites the original M3U file with the resolved URLs stored in state.
- Proceeds to `PROMPT_OPTIONS`.

### Download Files
- Extracts the M3U filename (without extension) to use as the output folder name.
- Downloads each URL in state to that folder (downloads may run in parallel).
- Terminates the program once all downloads are complete.
