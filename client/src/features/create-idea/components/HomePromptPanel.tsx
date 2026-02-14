import { AnimatePresence, motion, type MotionValue } from "framer-motion";
import { BreathingCursor } from "./BreathingCursor";
import { ScrabbleChar } from "./ScrabbleChar";
import { STYLE_TOKENS } from "../constants/styles";
import type { ScatterTarget } from "../types";

type HomePromptPanelProps = {
  isReturningHome: boolean;
  showPullHint: boolean;
  pullOpacity: MotionValue<number>;
  currentPrompt: string;
  promptChars: string[];
  scatterTargets: ScatterTarget[];
  pullY: MotionValue<number>;
  introActive: boolean;
  newCharStartIndex: number | null;
  showCursor: boolean;
  cursorOpacity: MotionValue<number>;
  onTapToCompose: () => void;
};

function PromptLine({
  currentPrompt,
  promptChars,
  scatterTargets,
  pullY,
  introActive,
  newCharStartIndex,
  showCursor,
  cursorOpacity,
  onTapToCompose,
  withLayout,
}: {
  currentPrompt: string;
  promptChars: string[];
  scatterTargets: ScatterTarget[];
  pullY: MotionValue<number>;
  introActive: boolean;
  newCharStartIndex: number | null;
  showCursor: boolean;
  cursorOpacity: MotionValue<number>;
  onTapToCompose: () => void;
  withLayout: boolean;
}) {
  return (
    <motion.div
      layoutId={withLayout ? "prompt-line" : undefined}
      layout={withLayout ? "position" : undefined}
      transition={withLayout ? { type: "spring", stiffness: 110, damping: 20 } : { duration: 0.25, delay: 0.05 }}
      initial={withLayout ? undefined : { opacity: 0 }}
      animate={withLayout ? undefined : { opacity: 1 }}
      className="cursor-pointer"
      onClick={onTapToCompose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTapToCompose();
        }
      }}
      data-testid="button-compose"
      role="button"
      tabIndex={0}
      aria-label={`Tap to start writing: ${currentPrompt}`}
    >
      <h1 className={`${STYLE_TOKENS.promptHeadingClass} text-white/40`} style={STYLE_TOKENS.promptHeadingStyle} data-testid="text-prompt">
        <BreathingCursor visible={showCursor} opacity={cursorOpacity} />
        <motion.span className="inline-flex" style={{ gap: 0, whiteSpace: "pre" }}>
          {promptChars.map((char, i) => (
            <ScrabbleChar
              key={i}
              char={char}
              index={i}
              target={scatterTargets[i] ?? { y: 0, rotate: 0 }}
              pullY={pullY}
              introActive={introActive}
              fadeInExtra={newCharStartIndex !== null && i >= newCharStartIndex}
            />
          ))}
        </motion.span>
      </h1>
    </motion.div>
  );
}

function BarsGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 11V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LeftGlyph() {
  return (
    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12H12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 12H16.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RightGlyph() {
  return (
    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
      <path d="M8.5 14.5C9.3 15.6 10.5 16.2 12 16.2C13.5 16.2 14.7 15.6 15.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function HomePromptPanel({
  isReturningHome,
  showPullHint,
  pullOpacity,
  currentPrompt,
  promptChars,
  scatterTargets,
  pullY,
  introActive,
  newCharStartIndex,
  showCursor,
  cursorOpacity,
  onTapToCompose,
}: HomePromptPanelProps) {
  return (
    <motion.div key="home" className="absolute inset-0" style={{ opacity: pullOpacity }}>
      <div className="absolute inset-0 flex flex-col items-start justify-center px-[30px] -translate-y-[50px]">
        <div className="relative w-full">
          {isReturningHome ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className={STYLE_TOKENS.rightNowClass}
                style={STYLE_TOKENS.rightNowStyle}
                data-testid="text-greeting"
              >
                right now
              </motion.div>
              <PromptLine
                currentPrompt={currentPrompt}
                promptChars={promptChars}
                scatterTargets={scatterTargets}
                pullY={pullY}
                introActive={introActive}
                newCharStartIndex={newCharStartIndex}
                showCursor={showCursor}
                cursorOpacity={cursorOpacity}
                onTapToCompose={onTapToCompose}
                withLayout={false}
              />
            </>
          ) : (
            <>
              <motion.div
                layoutId="right-now"
                layout="position"
                transition={{ type: "spring", stiffness: 110, damping: 20 }}
                className={STYLE_TOKENS.rightNowClass}
                style={STYLE_TOKENS.rightNowStyle}
                data-testid="text-greeting"
              >
                right now
              </motion.div>
              <PromptLine
                currentPrompt={currentPrompt}
                promptChars={promptChars}
                scatterTargets={scatterTargets}
                pullY={pullY}
                introActive={introActive}
                newCharStartIndex={newCharStartIndex}
                showCursor={showCursor}
                cursorOpacity={cursorOpacity}
                onTapToCompose={onTapToCompose}
                withLayout
              />
            </>
          )}

          <AnimatePresence>
            {showPullHint && (
              <div className="absolute inset-x-0 top-full mt-[clamp(20px,3.5vh,36px)] flex justify-center pointer-events-none">
                <motion.div
                  className="w-max flex flex-col items-center gap-1 text-center text-xs tracking-[0.08em] text-white/45"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8, transition: { duration: 0.18, ease: "easeOut" } }}
                  transition={{
                    delay: 4,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  data-testid="pull-refresh-hint"
                >
                  <span>pull to a new angle</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M7 2.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M3.5 7.5L7 11L10.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[136px] z-10 flex items-center justify-center gap-7 px-6">
        <button
          type="button"
          className="h-12 w-12 rounded-full bg-white/10 grid place-items-center text-white"
          aria-label="Quick action"
        >
          <LeftGlyph />
        </button>
        <button
          type="button"
          className="h-[79px] w-[79px] rounded-full bg-white/10 grid place-items-center text-white"
          onClick={onTapToCompose}
          aria-label="Create idea"
          data-testid="home-fab-compose"
        >
          <BarsGlyph className="h-8 w-8" />
        </button>
        <button
          type="button"
          className="h-12 w-12 rounded-full bg-white/10 grid place-items-center text-white"
          aria-label="Mood action"
        >
          <RightGlyph />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 h-[71px] bg-[#141414] px-6">
        <div className="h-full grid grid-cols-3 items-center text-white/50">
          <button type="button" className="flex flex-col items-center justify-center gap-1" aria-label="Ideas tab">
            <BarsGlyph className="h-4 w-4" />
            <span className="text-[11px] leading-none">ideas</span>
          </button>
          <button type="button" className="flex flex-col items-center justify-center gap-1 text-white/70" aria-label="Home tab">
            <BarsGlyph className="h-4 w-4" />
            <span className="text-[11px] leading-none">home</span>
          </button>
          <button type="button" className="flex flex-col items-center justify-center gap-1" aria-label="Muse tab">
            <BarsGlyph className="h-4 w-4" />
            <span className="text-[11px] leading-none">muse</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
