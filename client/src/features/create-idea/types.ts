export type MusePrompt = {
  id: string;
  label: string;
  insert: string;
};

export type ScatterTarget = {
  y: number;
  rotate: number;
};

export type IdeaAttributes = {
  energy: "dim" | "soft" | "bright";
  role: "spark" | "plan" | "grow";
  proximity: "daily" | "weekly" | "someday";
};

export type PostCaptureView = "fork" | "wizard";
