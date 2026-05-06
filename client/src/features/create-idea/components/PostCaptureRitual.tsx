import { AnimatePresence, motion } from "framer-motion";
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
  const step = POST_CAPTURE_STEPS[wizardStep];
  const selectedOption = attributes[step.key];
  const forkLabel = sourceText
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  const nextLabel = wizardStep === 2 ? "Finish" : "Next";
  const optionDescription = OPTION_DESCRIPTION[step.key][selectedOption];

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-[#101010]/92 px-6 pb-8 pt-16 backdrop-blur-sm">
      {view === "fork" && (
        <div className="absolute left-4 top-4 z-10 text-muted-foreground">
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
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/70"
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
                  className="text-[14px] leading-[1.2] text-white/75"
                  style={{ fontFamily: "'Roboto Serif', serif" }}
                  data-testid="text-fork-source"
                >
                  {forkLabel}
                </p>
              )}
              <h2
                className="mt-3 text-[32px] font-normal leading-[1.06] tracking-[-0.02em] text-white/90"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                what&apos;s next?
              </h2>

              <div className="mt-14 flex flex-col items-center gap-8">
                <button
                  type="button"
                  className="grid h-[220px] w-[220px] place-items-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.16),rgba(255,255,255,0.05)_45%,rgba(0,0,0,0.08)_100%)] text-[22px] font-medium text-white shadow-[0_0_50px_rgba(255,255,255,0.08)]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={onForkLetGlow}
                  data-testid="button-let-glow"
                >
                  Let it glow
                </button>

                <button
                  type="button"
                  className="h-[160px] w-[160px] rounded-full border-[4px] border-white/80 bg-transparent text-[18px] font-medium text-white"
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
            <div className="mt-24 flex flex-1 flex-col items-center">
              {forkLabel && (
                <p
                  className="text-[14px] leading-[1.2] text-white/75"
                  style={{ fontFamily: "'Roboto Serif', serif" }}
                  data-testid="text-wizard-source"
                >
                  {forkLabel}
                </p>
              )}
              <h2
                className="mt-3 text-center text-[32px] font-normal leading-[1.06] tracking-[-0.02em] text-white/90"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {step.title}
              </h2>

              <div className="mt-16">
                <IdeaOrb attributes={attributes} isLaunching={isOrbLaunching} />
              </div>

              <p
                className="mt-10 min-h-[56px] max-w-[220px] text-center text-[18px] italic leading-[1.25] text-white/75"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                data-testid={`text-option-description-${step.key}`}
              >
                {optionDescription}
              </p>

              <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
                {step.options.map((option) => {
                  const isSelected = option === selectedOption;
                  return (
                    <button
                      type="button"
                      key={option}
                      className={`rounded-3xl px-5 py-3 text-[20px] transition-colors ${
                        isSelected
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/65 hover:bg-white/15"
                      }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                      onClick={() => onWizardSelect(option)}
                      data-testid={`button-option-${step.key}-${option}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="h-11 rounded-3xl bg-white/10 px-5 text-base text-white"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={onWizardBack}
                  data-testid="button-wizard-back"
                >
                  Back
                </button>
                <button
                  type="button"
                  className="h-11 rounded-3xl bg-white px-5 text-base text-black"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={onWizardNext}
                  data-testid="button-wizard-next"
                >
                  {nextLabel}
                </button>
              </div>

              <div className="mb-1 mt-4 flex items-center justify-center gap-2" aria-label="Wizard step indicator">
                {POST_CAPTURE_STEPS.map((_, index) => {
                  const isActive = index === wizardStep;
                  return (
                    <span
                      key={`wizard-step-dot-${index}`}
                      className={`block h-2.5 rounded-full transition-all duration-200 ${
                        isActive ? "w-6 bg-white/90" : "w-2.5 bg-white/35"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
