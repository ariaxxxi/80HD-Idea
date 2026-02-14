import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import letItGlowCircleImage from "@assets/letitglow-circle.png";
import { POST_CAPTURE_STEPS } from "../constants/postCapture";
import type { IdeaAttributes, PostCaptureView } from "../types";
import { IdeaOrb } from "./IdeaOrb";

type PostCaptureRitualProps = {
  view: PostCaptureView;
  wizardStep: 0 | 1 | 2;
  attributes: IdeaAttributes;
  isOrbLaunching: boolean;
  sourceText: string;
  onForkBack: () => void;
  onForkCaptureNow: () => void;
  onForkLetGlow: () => void;
  onWizardBack: () => void;
  onWizardNext: () => void;
  onWizardSelect: (value: string) => void;
};

const OPTION_DESCRIPTION: Record<"energy" | "role" | "proximity", Record<string, string>> = {
  energy: {
    dim: '"Just a glimmer."',
    soft: '"It\'s interesting, but I\'m exploring."',
    bright: '"I\'m obsessed. I want to work on this now."',
  },
  role: {
    spark: '"A spark to keep close."',
    plan: '"Ready to be shaped into steps."',
    grow: '"Needs time and nurturing."',
  },
  proximity: {
    daily: '"Keep this in today\'s orbit."',
    weekly: '"Important this week, no rush today."',
    someday: '"Save this for the right moment."',
  },
};

export function PostCaptureRitual({
  view,
  wizardStep,
  attributes,
  isOrbLaunching,
  sourceText,
  onForkBack,
  onForkCaptureNow,
  onForkLetGlow,
  onWizardBack,
  onWizardNext,
  onWizardSelect,
}: PostCaptureRitualProps) {
  const [dragPreviewIndex, setDragPreviewIndex] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastHighlightedIndexRef = useRef<number | null>(null);
  const step = POST_CAPTURE_STEPS[wizardStep];
  const nextLabel = wizardStep === 2 ? "Finish" : "Next";
  const forkLabel = sourceText
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  const selectedOption = attributes[step.key];
  const selectedIndex = step.options.findIndex((option) => option === selectedOption);
  const highlightedIndex = dragPreviewIndex ?? selectedIndex;
  const previewOption = step.options[highlightedIndex];
  const optionDescription = OPTION_DESCRIPTION[step.key][previewOption];
  const previewAttributes: IdeaAttributes =
    step.key === "energy"
      ? { ...attributes, energy: previewOption as IdeaAttributes["energy"] }
      : step.key === "role"
        ? { ...attributes, role: previewOption as IdeaAttributes["role"] }
        : { ...attributes, proximity: previewOption as IdeaAttributes["proximity"] };

  const computeNearestIndex = (x: number) => {
    const raw = 1 - x / 112;
    return Math.max(0, Math.min(step.options.length - 1, Math.round(raw)));
  };

  const handlePickerDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const baseX = (1 - selectedIndex) * 112;
    const liveX = baseX + info.offset.x;
    setDragPreviewIndex(computeNearestIndex(liveX));
  };

  const handlePickerDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const baseX = (1 - selectedIndex) * 112;
    const liveX = baseX + info.offset.x;
    const nextIndex = computeNearestIndex(liveX);
    setDragPreviewIndex(null);
    if (nextIndex !== selectedIndex) {
      onWizardSelect(step.options[nextIndex]);
    }
  };

  useEffect(() => {
    if (view !== "wizard") return;

    if (lastHighlightedIndexRef.current === null) {
      lastHighlightedIndexRef.current = highlightedIndex;
      return;
    }

    if (lastHighlightedIndexRef.current === highlightedIndex) return;
    lastHighlightedIndexRef.current = highlightedIndex;

    try {
      const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new Ctx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 1100;
      gain.gain.value = 0.0001;
      gain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.055);
    } catch {
      // Ignore audio errors to keep interaction resilient.
    }
  }, [highlightedIndex, view]);

  return (
    <div className="fixed inset-0 z-[95] bg-[#101010] px-6 pb-8 pt-16 flex flex-col">
      {view === "fork" && (
        <div className="absolute top-4 left-4 z-10 text-muted-foreground">
          <button
            type="button"
            className="h-10 w-10 grid place-items-center"
            onClick={onForkBack}
            data-testid="button-fork-back"
            aria-label="Back to composer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
      {view === "wizard" && (
        <div className="absolute top-4 left-4 z-10">
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-white/60"
            onClick={onWizardBack}
            data-testid="button-wizard-close"
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
      <AnimatePresence mode="wait">
        {view === "fork" && (
          <motion.div
            key="capture-fork"
            className="h-full flex flex-col"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div className="mt-24 -translate-y-[100px] flex flex-col items-center">
              <div className="translate-y-[50px] flex flex-col items-center">
                {forkLabel && (
                  <p
                    className="text-white/80 text-[14px] leading-[1.2]"
                    style={{ fontFamily: "'Roboto Serif', serif" }}
                    data-testid="text-fork-source"
                  >
                    {forkLabel}
                  </p>
                )}
                <h2
                  className="mt-2 text-white/85 text-[32px] leading-[1.06] font-normal tracking-[-0.02em]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  what&apos;s next?
                </h2>
              </div>

              <div className="mt-14 flex flex-col items-center gap-10">
                <button
                  type="button"
                  className="relative translate-y-[10px] h-[312px] w-[312px] rounded-full bg-[#101010] text-white text-[20px] font-medium"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={onForkLetGlow}
                  data-testid="button-let-glow"
                >
                  <img
                    src={letItGlowCircleImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain pointer-events-none"
                    aria-hidden="true"
                  />
                  <span className="relative z-10">Let it glow</span>
                </button>

                <button
                  type="button"
                  className="-translate-y-[10px] h-[240px] w-[240px] rounded-full border-[5px] border-white/80 bg-[#101010] text-white text-[20px] font-medium"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={onForkCaptureNow}
                  data-testid="button-capture-now"
                >
                  Just capture it
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {view === "wizard" && (
          <motion.div
            key="capture-wizard"
            className="h-full flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`wizard-step-${wizardStep}`}
                className="h-full flex flex-col"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mt-24 -translate-y-[100px] flex flex-col items-center">
                  <div className="translate-y-[50px] flex flex-col items-center">
                    {forkLabel && (
                      <p
                        className="text-white/80 text-[14px] leading-[1.2]"
                        style={{ fontFamily: "'Roboto Serif', serif" }}
                        data-testid="text-wizard-source"
                      >
                        {forkLabel}
                      </p>
                    )}
                    <h2
                      className="mt-2 text-white/85 text-[32px] leading-[1.06] font-normal tracking-[-0.02em]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {step.title}
                    </h2>
                  </div>
                </div>

                <div className="-mt-14 flex-1 flex flex-col items-center">
                  <div className="mt-20">
                    <IdeaOrb attributes={previewAttributes} isLaunching={isOrbLaunching} />
                  </div>

                  <p
                    className="mt-16 mx-auto max-w-[200px] text-center text-white/75 text-[18px] leading-[1.25] italic min-h-[56px]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    data-testid={`text-option-description-${step.key}`}
                  >
                    {optionDescription}
                  </p>

                  <div className="relative mt-24 w-full max-w-[340px] overflow-hidden">
                    <motion.div
                      className="flex items-center touch-pan-x cursor-grab active:cursor-grabbing"
                      drag="x"
                      dragElastic={0}
                      dragMomentum={false}
                      onDragEnd={handlePickerDragEnd}
                      onDrag={handlePickerDrag}
                      animate={{ x: (1 - selectedIndex) * 112 }}
                      transition={{ type: "spring", stiffness: 220, damping: 28 }}
                    >
                      {step.options.map((option) => {
                        const optionIndex = step.options.findIndex((value) => value === option);
                        const isSelected = optionIndex === highlightedIndex;
                        return (
                          <button
                            type="button"
                            key={option}
                            className={`w-[112px] text-center transition-all duration-200 ${
                              isSelected ? "text-white text-[32px]" : "text-white/40 text-[32px]"
                            }`}
                            style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: 1.1 }}
                            onClick={() => onWizardSelect(option)}
                            data-testid={`button-option-${step.key}-${option}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </motion.div>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#101010] to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#101010] to-transparent" />
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <button
                    type="button"
                    className="h-11 px-5 rounded-3xl bg-white/10 text-white text-base"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onClick={onWizardBack}
                    data-testid="button-wizard-back"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="h-11 px-5 rounded-3xl bg-white text-black text-base"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onClick={onWizardNext}
                    data-testid="button-wizard-next"
                  >
                    {nextLabel}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
