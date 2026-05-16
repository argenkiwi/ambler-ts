# Program Specifications

A CLI application for sorting CSV data interactively by comparing rows. The user specifies a CSV file, optionally confirms headers are present, and can add a new row (sorted via binary insertion using pairwise comparison), reorder an entire file through the same comparison-driven sort, list current rows, or quit.

## Nodes

### GET_CSV_PATH
- Initial node.
- Prompts the user to enter the path to a CSV file and stores it.
- Transitions to `HAS_HEADER`.

### HAS_HEADER
- Asks the user whether the CSV file has a header row (yes/no).
- Reads the CSV file into memory using the header flag.
- Transitions to `CHOOSE_ACTION`.

### CHOOSE_ACTION
- Presents a menu of actions to the user.
- If the user chooses `add`, transitions to `GET_NEW_ROW`.
- If the user chooses `reorder`, transitions to `REORDER_ROWS`.
- If the user chooses `list`, transitions to `LIST_ROWS`.
- If the user chooses `quit`, transitions to `END`.

### LIST_ROWS
- Prints each row in the CSV data to the console.
- After displaying the rows, transitions back to `CHOOSE_ACTION`.

### GET_NEW_ROW
- Prompts the user to enter a new row as comma-separated values and parses it into a list.
- Transitions to `SORT_ROW`.

### SORT_ROW
- Inserts the new row into the existing data using binary insertion.
- Position is determined by pairwise comparison with existing rows.
- Transitions to `SAVE_FILE`.

### REORDER_ROWS
- Re-sorts the entire dataset using binary insertion.
- Each row is inserted in order based on pairwise comparison.
- Transitions to `SAVE_FILE`.

### SAVE_FILE
- Writes the current data back to the CSV file, preserving the header if one was present.
- Displays a confirmation message.
- Transitions back to `CHOOSE_ACTION`, allowing the user to perform additional actions.

### END
- Termination node.
- Displays no output and exits the application.

## Shared State

The shared state consists of:
- `csv_path`: The path to the CSV file being edited.
- `has_header`: Boolean indicating whether the CSV file has a header row.
- `header`: The header row values (list of strings), if present.
- `data`: A list of rows (each row is a list of strings) representing the CSV content.
- `action`: The currently selected action (`add`, `reorder`, `list`, or `quit`).
- `new_row`: The newly entered row (list of strings) awaiting sort.
