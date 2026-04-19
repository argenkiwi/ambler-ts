import { amble, Nextable, node } from "../ambler.ts";
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

const nodes: Record<string, Nextable<State>> = {
  start: node(() =>
    OllamaDiscoverNode.create({ onDiscovered: nodes.modelSelect }),
  ),
  modelSelect: node(() => ModelSelectNode.create({ onSelect: nodes.prompt })),
  prompt: node(() =>
    SolarPromptNode.create({ onPromptComplete: nodes.generate }),
  ),
  generate: node(() =>
    SolarGenerateNode.create({ onGenerateComplete: nodes.save }),
  ),
  save: node(() =>
    SolarSaveNode.create({ onSaveComplete: (state: State) => null }),
  ),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
