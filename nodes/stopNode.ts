export interface State {
  count: number;
}

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export function create(utils: Utils = defaultUtils) {
  return <S extends State>(state: S) => {
    utils.print(`Final count: ${state.count}`);
    return null;
  };
}
