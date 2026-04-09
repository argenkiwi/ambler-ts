import { amble, node, Nextable } from "../ambler.ts";
import { SelectModelNode } from "../nodes/selectModelNode.ts";
import { ChatNode } from "../nodes/chatNode.ts";

export interface State {
  model: string;
}

const initialState: State = {
  model: "",
};

const nodes: Record<string, Nextable<State>> = {
  selectModel: node(() => SelectModelNode.create({ onSuccess: nodes.chat })),
  chat: node(() => ChatNode.create({ onContinue: nodes.chat })),
};

if (import.meta.main) {
  await amble(nodes.selectModel, initialState);
}
