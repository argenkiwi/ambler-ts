/**
 * Represents a value that can be either a synchronous value or a Promise of that value.
 */
type MaybePromise<T> = T | Promise<T>;

/**
 * A function that represents a node in the state machine.
 * Given the current state, it returns the next step in the machine or null if the machine should terminate.
 *
 * @template S The type of the machine's state.
 */
export type Nextable<S> = (state: S) => MaybePromise<Next<S> | null>;

/**
 * Represents the result of a node's execution, providing a way to advance to the next step.
 *
 * @template S The type of the machine's state.
 */
export interface Next<S> {
  /**
   * Executes the next step in the state machine.
   * @returns A promise that resolves to the next step or null if the machine terminates.
   */
  run(): MaybePromise<Next<S> | null>;
}

/**
 * Wraps a {@link Nextable} function and a state into a {@link Next} object.
 * This allows for easier creation of transitions.
 *
 * @template S The type of the machine's state.
 * @param nextFunc The function representing the next node.
 * @param state The current state of the machine.
 * @returns A {@link Next} object that, when run, executes the provided {@link Nextable}.
 */
export function next<S>(nextFunc: Nextable<S>, state: S): Next<S> {
  return { run: () => nextFunc(state) };
}

/**
 * Wraps a node factory function into a {@link Nextable} function.
 * This is useful for creating cyclic graphs by allowing the factory to be re-evaluated
 * on each execution, avoiding circular reference issues.
 *
 * @template S The type of the machine's state.
 * @param factory A function that returns a {@link Nextable} function.
 * @returns A {@link Nextable} function that calls the factory and then executes the resulting node.
 */
export function node<S>(factory: () => Nextable<S>): Nextable<S> {
  return (state: S) => factory()(state);
}

/**
 * The main execution loop that drives the state machine.
 * It starts with the initial node and continues to execute subsequent nodes until
 * a node returns null.
 *
 * @template S The type of the machine's
 * @param initial The first node in the state machine.
 * @param state The initial state of the machine.
 * @returns A promise that resolves when the state machine completes.
 */
export async function amble<S>(initial: Nextable<S>, state: S): Promise<void> {
  let step: Next<S> | null = await initial(state);
  while (step) {
    step = await step.run();
  }
}
