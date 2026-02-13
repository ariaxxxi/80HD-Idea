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
      <h1 className={STYLE_TOKENS.promptHeadingClass} style={STYLE_TOKENS.promptHeadingStyle} data-testid="text-prompt">
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
        <BreathingCursor visible={showCursor} opacity={cursorOpacity} />
      </h1>
    </motion.div>
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
    <motion.div key="home" className="absolute inset-0 flex flex-col items-start justify-center px-[30px] translate-y-[50px]" style={{ opacity: pullOpacity }}>
      <AnimatePresence>
        {showPullHint && (
          <motion.div
            className="absolute top-4 left-0 w-full flex flex-col items-center gap-1 text-center text-xs tracking-[0.08em] uppercase text-white/55 pointer-events-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: [0, 2, 0] }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              opacity: { delay: 2, duration: 0.35, ease: "easeOut" },
              y: { delay: 2, duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            }}
            data-testid="pull-refresh-hint"
          >
            <span>pull to refresh</span>
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
              <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
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
    </motion.div>
  );
}
