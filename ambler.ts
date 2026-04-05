export type Nextable<S> = (state: S) => Promise<Next<S> | null>;

export class Next<S> {
    constructor(private nextFunc: Nextable<S>, private state: S) {}

    run(): Promise<Next<S> | null> {
        return this.nextFunc(this.state);
    }
}

export function node<S>(factory: () => Nextable<S>): Nextable<S> {
  return (state: S) => factory()(state);
}

export async function amble<S>(initial: Nextable<S>, state: S): Promise<void> {
    let next: Next<S> | null = await initial(state);
    while (next) {
        next = await next.run();
    }
}
