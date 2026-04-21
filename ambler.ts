type MaybePromise<T> = T | Promise<T>;

export type Nextable<S> = (state: S) => MaybePromise<Next<S> | null>;

export interface Next<S> {
  run(): MaybePromise<Next<S> | null>;
}

export function next<S>(nextFunc: Nextable<S>, state: S): Next<S> {
  return { run: () => nextFunc(state) };
}

export function node<S>(factory: () => Nextable<S>): Nextable<S> {
  return (state: S) => factory()(state);
}

export async function amble<S>(initial: Nextable<S>, state: S): Promise<void> {
  let step: Next<S> | null = await initial(state);
  while (step) {
    step = await step.run();
  }
}
