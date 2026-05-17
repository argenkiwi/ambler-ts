# Program Specifications

Whimsort is a command-line tool that allows users to sort CSV files based on their subjective comparison of rows. Users can add a new row and place it in the correct sorted position via pairwise comparison, reorder an entire existing file using the same comparison-driven approach, list current rows, or quit.

## Nodes

### GET_CSV_PATH
- Initial node.
- Prompts the user to enter the path to a CSV file.
- Transitions to `HAS_HEADER`.

### HAS_HEADER
- Asks the user whether the CSV file has a header row (yes/no).
- Reads the CSV file into memory, respecting the header flag.
- The header row is excluded from sorting.
- Transitions to `CHOOSE_ACTION`.

### CHOOSE_ACTION
- Presents a menu of actions: `add`, `reorder`, `list`, or `quit`.
- If the user chooses `add`, transitions to `GET_NEW_ROW`.
- If the user chooses `reorder`, transitions to `REORDER_ROWS`.
- If the user chooses `list`, transitions to `LIST_ROWS`.
- If the user chooses `quit`, transitions to `END`.

### LIST_ROWS
- Displays the current rows in the file and transitions back to `CHOOSE_ACTION`.

### GET_NEW_ROW
- Prompts the user to enter the content for a new row as comma-separated values.
- Parses the row into a list of values.
- Transitions to `SORT_ROW`.

### SORT_ROW
- Uses a binary insertion algorithm to find the correct position for the new row.
- Prompts the user for pairwise comparisons between rows.
- Inserts the new row at the determined position.
- Transitions to `SAVE_FILE`.

### REORDER_ROWS
- Iterates through each row, treating the first row as the initial sorted list.
- For each subsequent row, uses the binary insertion algorithm with user comparison to place it into the sorted portion of the list.
- Transitions to `SAVE_FILE`.

### SAVE_FILE
- Writes the sorted data back to the CSV file, preserving the header if one was present.
- Returns to `CHOOSE_ACTION`, allowing the user to perform additional actions.

### END
- Termination node.
- Exits the application.

## Shared State

The shared state consists of:
- `csv_path`: The path to the CSV file being edited.
- `has_header`: Boolean indicating whether the CSV file has a header row.
- `header`: The header row values (list of strings), if present.
- `data`: A list of rows (each row is a list of strings) representing the sortable CSV content.
- `new_row`: The newly entered row (list of strings) awaiting sort placement.
