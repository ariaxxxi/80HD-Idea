import type { MusePrompt } from "../types";

export const PROMPTS = [
  "i'm thinking about",
  "i want to build",
  "i want to learn",
  "i'm curious about",
  "i want to create",
];

export const STARTER_CHIPS = [
  "a music loop",
  "a portfolio piece",
  "something bold",
];

export const CURATED_MUSE_PROMPTS: MusePrompt[] = [
  { id: "who-for", label: "Who is it for?", insert: "\nIt is designed for people who " },
  { id: "twist", label: "What's the twist?", insert: "\nThe unique twist is that " },
  { id: "vibe", label: "What's the vibe?", insert: "\nThe visual aesthetic feels like " },
  { id: "first-step", label: "First step?", insert: "\nThe very first thing to do is " },
  { id: "core-problem", label: "Core problem?", insert: "\nThe main problem this solves is " },
  { id: "moment", label: "When does it click?", insert: "\nThis feels most useful when " },
  { id: "emotion", label: "What should it feel like?", insert: "\nI want people to feel " },
  { id: "risk", label: "Biggest risk?", insert: "\nThe biggest risk to watch is " },
  { id: "proof", label: "How to test it fast?", insert: "\nA quick way to validate this is " },
  { id: "scope-cut", label: "What can we cut?", insert: "\nTo keep it simple, we can remove " },
];
