import type { ScatterTarget } from "../types";

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function generateScatterTargets(length: number): ScatterTarget[] {
  return Array.from({ length }, () => ({
    y: randomRange(10, 60),
    rotate: randomRange(-15, 15),
  }));
}

export function expandScatterTargets(targets: ScatterTarget[], length: number): ScatterTarget[] {
  if (targets.length >= length) {
    return targets.slice(0, length);
  }
  const extras = generateScatterTargets(length - targets.length);
  return [...targets, ...extras];
}
