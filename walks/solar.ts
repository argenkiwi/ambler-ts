import { amble, Node, node, stop } from "../ambler.ts";
import * as OllamaDiscoverNode from "../nodes/ollamaDiscoverNode.ts";
import * as ModelSelectNode from "../nodes/modelSelectNode.ts";
import * as SolarPromptNode from "../nodes/solarPromptNode.ts";
import * as SolarGenerateNode from "../nodes/solarGenerateNode.ts";
import * as SolarSaveNode from "../nodes/solarSaveNode.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
  generatedStory: string;
}

const initialState: State = {
  ollamaHost: "",
  selectedModel: "",
  solarPrompt: "",
  generatedStory: "",
};

const nodes: Record<string, Node<State>> = {
  start: node(() =>
    OllamaDiscoverNode.create({
      onDiscovered: nodes.modelSelect,
      onCancel: () => stop(),
    })
  ),
  modelSelect: node(() =>
    ModelSelectNode.create({
      onSelect: nodes.prompt,
      onCancel: () => stop(),
    })
  ),
  prompt: node(() =>
    SolarPromptNode.create({
      onPromptComplete: nodes.generate,
      onCancel: () => stop(),
    })
  ),
  generate: node(() =>
    SolarGenerateNode.create({
      onGenerateComplete: nodes.save,
      onError: () => stop(),
    })
  ),
  save: node(() =>
    SolarSaveNode.create({ onSaveComplete: (_state: State) => stop() })
  ),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
