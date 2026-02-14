import type { IdeaAttributes } from "../types";

export const DEFAULT_IDEA_ATTRIBUTES: IdeaAttributes = {
  energy: "soft",
  role: "plan",
  proximity: "weekly",
};

export const POST_CAPTURE_STEPS = [
  {
    key: "energy",
    title: "this ideas feels...",
    options: ["dim", "soft", "bright"] as const,
  },
  {
    key: "role",
    title: "i need help with...",
    options: ["spark", "plan", "grow"] as const,
  },
  {
    key: "proximity",
    title: "i want to visit it...",
    options: ["daily", "weekly", "someday"] as const,
  },
] as const;

export type PostCaptureStep = (typeof POST_CAPTURE_STEPS)[number];
