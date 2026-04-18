
# Program Specifications

This program is a simple counter application that demonstrates the use of `ambler.ts` for defining program stages and transitions.

## Shared State

The shared state is an integer representing the current count.

## Steps

### Start
- This is the initial step of the application.
- Prompts the user to enter a starting number for the count.
- If the input is empty, it proceeds to `COUNT` using the default value. 
- If the number entered is valid, it proceeds to `COUNT`.
- If the number entered is invalid, it displays an error message and proceeds to `START`.

### Count
- Prints the current count, waits for a second and increments the counter.
- It randomly decides whether to transition to `COUNT` or to `STOP`.

### Stop
-  Displays the final count and terminates the counting process.
