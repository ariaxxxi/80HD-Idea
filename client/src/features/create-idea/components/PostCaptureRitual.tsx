import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
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

const OPTION_DESCRIPTION: Record<
  "energy" | "role" | "proximity",
  Record<string, string>
> = {
  energy: {
    dim: '"Just a glimmer."',
    soft: '"It is interesting, but I am exploring."',
    bright: '"I am obsessed. I want to work on this now."',
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

const SURFACE = "#C3D0D5";

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
  const pickerViewportRef = useRef<HTMLDivElement | null>(null);
  const previousWizardStepRef = useRef(wizardStep);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastHighlightedIndexRef = useRef<number | null>(null);
  const [dragPreviewIndex, setDragPreviewIndex] = useState<number | null>(null);
  const [pickerViewportWidth, setPickerViewportWidth] = useState(340);
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);

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

  const OPTION_GAP = 18;
  const optionWidths = useMemo(
    () =>
      step.options.map((option) => {
        if (typeof document === "undefined") return Math.max(72, option.length * 20);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return Math.max(72, option.length * 20);
        context.font = "400 32px 'DM Sans'";
        return Math.ceil(context.measureText(option).width);
      }),
    [step.options],
  );

  const optionCenters = useMemo(() => {
    const centers: number[] = [];
    let cursor = 0;
    optionWidths.forEach((width, index) => {
      if (index === 0) {
        cursor = width / 2;
      } else {
        cursor += optionWidths[index - 1] / 2 + OPTION_GAP + width / 2;
      }
      centers.push(cursor);
    });
    return centers;
  }, [optionWidths]);

  const pickerTrackWidth = useMemo(() => {
    if (optionCenters.length === 0) return 0;
    return optionCenters[optionCenters.length - 1] + optionWidths[optionWidths.length - 1] / 2;
  }, [optionCenters, optionWidths]);

  const pickerTargetX = useMemo(
    () => optionCenters.map((center) => pickerViewportWidth / 2 - center),
    [optionCenters, pickerViewportWidth],
  );

  const computeNearestIndex = (x: number) => {
    if (pickerTargetX.length === 0) return 0;
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    pickerTargetX.forEach((target, index) => {
      const distance = Math.abs(x - target);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });
    return nearest;
  };

  const handlePickerDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const baseX = pickerTargetX[selectedIndex] ?? 0;
    const liveX = baseX + info.offset.x;
    setDragPreviewIndex(computeNearestIndex(liveX));
  };

  const handlePickerDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const baseX = pickerTargetX[selectedIndex] ?? 0;
    const liveX = baseX + info.offset.x;
    const nextIndex = computeNearestIndex(liveX);
    setDragPreviewIndex(null);
    if (nextIndex !== selectedIndex) {
      onWizardSelect(step.options[nextIndex]);
    }
  };

  useEffect(() => {
    if (view !== "wizard") return;
    const previous = previousWizardStepRef.current;
    if (wizardStep !== previous) {
      setStepDirection(wizardStep > previous ? 1 : -1);
      previousWizardStepRef.current = wizardStep;
      setDragPreviewIndex(null);
    }
  }, [view, wizardStep]);

  useEffect(() => {
    const viewport = pickerViewportRef.current;
    if (!viewport) return;

    const update = () => setPickerViewportWidth(viewport.offsetWidth || 340);
    update();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (view !== "wizard") return;

    if (lastHighlightedIndexRef.current === null) {
      lastHighlightedIndexRef.current = highlightedIndex;
      return;
    }

    if (lastHighlightedIndexRef.current === highlightedIndex) return;
    lastHighlightedIndexRef.current = highlightedIndex;

    try {
      const Ctx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
    <div className="fixed inset-0 z-[95] flex flex-col bg-[#C3D0D5] px-6 pb-8 pt-16">
      {view === "fork" && (
        <div className="absolute left-4 top-4 z-10 text-black/70">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center"
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
        <div className="absolute left-4 top-4 z-10">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/40 text-black"
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
            className="flex h-full flex-col"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div className="mt-24 flex flex-1 flex-col items-center justify-center">
              {forkLabel && (
                <p
                  className="text-[14px] leading-[1.2] text-black/70"
                  style={{ fontFamily: "'Roboto Serif', serif" }}
                  data-testid="text-fork-source"
                >
                  {forkLabel}
                </p>
              )}
              <h2
                className="mt-3 text-[32px] font-normal leading-[1.06] tracking-[-0.02em] text-black/85"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                what&apos;s next?
              </h2>

              <div className="mt-14 flex flex-col items-center gap-8">
                <button
                  type="button"
                  className="grid h-[220px] w-[220px] place-items-center rounded-full bg-white/40 text-[22px] font-medium text-black"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={onForkLetGlow}
                  data-testid="button-let-glow"
                >
                  Let it glow
                </button>

                <button
                  type="button"
                  className="h-[160px] w-[160px] rounded-full bg-white/40 text-[18px] font-medium text-black"
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
            className="flex h-full flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="flex h-full flex-col">
              <div className="mt-24 flex flex-col items-center">
                {forkLabel && (
                  <p
                    className="text-[14px] leading-[1.2] text-black/70"
                    style={{ fontFamily: "'Roboto Serif', serif" }}
                    data-testid="text-wizard-source"
                  >
                    {forkLabel}
                  </p>
                )}
                <AnimatePresence mode="wait" custom={stepDirection}>
                  <motion.h2
                    key={`wizard-title-${wizardStep}`}
                    custom={stepDirection}
                    className="mt-3 text-center text-[32px] font-normal leading-[1.06] tracking-[-0.02em] text-black/85"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    initial={{ x: stepDirection * 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: stepDirection * -20, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step.title}
                  </motion.h2>
                </AnimatePresence>
              </div>

              <div className="flex flex-1 flex-col items-center">
                <div className="mt-16">
                  <IdeaOrb attributes={previewAttributes} isLaunching={isOrbLaunching} />
                </div>

                <AnimatePresence mode="wait" custom={stepDirection}>
                  <motion.p
                    key={`wizard-description-${wizardStep}`}
                    custom={stepDirection}
                    className="mt-12 min-h-[56px] max-w-[220px] text-center text-[18px] italic leading-[1.25] text-black/65"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    data-testid={`text-option-description-${step.key}`}
                    initial={{ x: stepDirection * 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: stepDirection * -20, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {optionDescription}
                  </motion.p>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`wizard-slider-${wizardStep}`}
                    className="flex w-full justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <div ref={pickerViewportRef} className="relative mt-24 w-full max-w-[340px] overflow-hidden">
                      <motion.div
                        className="flex cursor-grab items-center touch-pan-x active:cursor-grabbing"
                        drag="x"
                        dragElastic={0}
                        dragMomentum={false}
                        onDragEnd={handlePickerDragEnd}
                        onDrag={handlePickerDrag}
                        animate={{ x: pickerTargetX[selectedIndex] ?? 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 28 }}
                        style={{ width: pickerTrackWidth, gap: `${OPTION_GAP}px` }}
                      >
                        {step.options.map((option) => {
                          const optionIndex = step.options.findIndex((value) => value === option);
                          const isSelected = optionIndex === highlightedIndex;
                          return (
                            <button
                              type="button"
                              key={option}
                              className={`shrink-0 text-center text-[32px] transition-all duration-200 ${
                                isSelected ? "text-black" : "text-black/35"
                              }`}
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                lineHeight: 1.1,
                                width: `${optionWidths[optionIndex] || 72}px`,
                              }}
                              onClick={() => onWizardSelect(option)}
                              data-testid={`button-option-${step.key}-${option}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </motion.div>
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-40"
                        style={{ background: `linear-gradient(to right, ${SURFACE} 0%, transparent 100%)` }}
                      />
                      <div
                        className="pointer-events-none absolute inset-y-0 right-0 w-40"
                        style={{ background: `linear-gradient(to left, ${SURFACE} 0%, transparent 100%)` }}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    className="h-11 rounded-3xl bg-white/40 px-5 text-base text-black"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onClick={onWizardBack}
                    data-testid="button-wizard-back"
                  >
                    Back
                  </button>
                  <div className="flex items-center justify-center gap-2" aria-label="Wizard step indicator">
                    {POST_CAPTURE_STEPS.map((_, index) => {
                      const isActive = index === wizardStep;
                      return (
                        <span
                          key={`wizard-step-dot-${index}`}
                          className={`block h-2.5 rounded-full transition-all duration-200 ${
                            isActive ? "w-6 bg-black/85" : "w-2.5 bg-black/20"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="h-11 rounded-3xl bg-black px-5 text-base text-white"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onClick={onWizardNext}
                    data-testid="button-wizard-next"
                  >
                    {nextLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
