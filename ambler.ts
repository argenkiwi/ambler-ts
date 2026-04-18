export type Nextable<S> = (state: S) => Promise<Next<S> | null>;

export interface Next<S> {
    run(): Promise<Next<S> | null>;
}

export function next<S>(nextFunc: Nextable<S>, state: S): Next<S> {
    return { run: () => nextFunc(state) };
}

export const defaultPrint = (msg: string): void => console.log(msg);
export const defaultReadLine = async (msg: string): Promise<string | null> => prompt(msg);

export function node<S>(factory: () => Nextable<S>): Nextable<S> {
  return (state: S) => factory()(state);
}

export async function amble<S>(initial: Nextable<S>, state: S): Promise<void> {
    let step: Next<S> | null = await initial(state);
    while (step) {
        step = await step.run();
    }
}
