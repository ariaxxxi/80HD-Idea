import { CURATED_MUSE_PROMPTS } from "../constants/prompts";
import type { MusePrompt } from "../types";

export function generatePrompts(currentText: string, excludedIds: string[] = []): MusePrompt[] {
  const lower = currentText.toLowerCase();
  const orderedIds: string[] = [];

  if (/user|audience|for people|customer/.test(lower)) {
    orderedIds.push("twist", "vibe", "first-step", "moment", "proof");
  } else if (/visual|style|look|aesthetic|brand/.test(lower)) {
    orderedIds.push("vibe", "emotion", "who-for", "twist", "scope-cut");
  } else if (/build|ship|step|start|plan/.test(lower)) {
    orderedIds.push("first-step", "proof", "risk", "who-for", "twist");
  } else {
    orderedIds.push("who-for", "twist", "vibe", "first-step", "core-problem", "proof");
  }

  orderedIds.push("core-problem", "moment", "emotion", "risk", "scope-cut");

  const promptsById = new Map(CURATED_MUSE_PROMPTS.map((prompt) => [prompt.id, prompt]));
  const selected: MusePrompt[] = [];

  for (const id of orderedIds) {
    const prompt = promptsById.get(id);
    if (!prompt) continue;
    if (excludedIds.includes(prompt.id)) continue;
    if (selected.some((item) => item.id === prompt.id)) continue;
    selected.push(prompt);
    if (selected.length === 3) break;
  }

  if (selected.length < 3) {
    for (const prompt of CURATED_MUSE_PROMPTS) {
      if (excludedIds.includes(prompt.id)) continue;
      if (selected.some((item) => item.id === prompt.id)) continue;
      selected.push(prompt);
      if (selected.length === 3) break;
    }
  }

  if (selected.length < 3) {
    for (const prompt of CURATED_MUSE_PROMPTS) {
      if (selected.some((item) => item.id === prompt.id)) continue;
      selected.push(prompt);
      if (selected.length === 3) break;
    }
  }

  return selected;
}
