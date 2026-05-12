# Program Specifications

This program is a simple counter application that demonstrates the use of `ambler.ts` for defining program stages and transitions.

## Nodes

### Start
- Initial node of the application.
- Prompts the user to enter a starting number for the count.
- If the input is empty, it transitions to `COUNT` using the default value. 
- If the number entered is valid, it transitions to `COUNT`.
- If the number entered is invalid, it displays an error message and transitions to `START`.

### Count
- Prints the current count, waits for a second and increments the counter.
- It randomly decides whether to transition to `COUNT` or to `STOP`.

### Stop
- Displays the final count and terminates.

## Shared State

The shared state consists of:
- `count`: An integer representing the current value.
