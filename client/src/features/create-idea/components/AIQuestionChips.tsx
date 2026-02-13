import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { STYLE_TOKENS } from "../constants/styles";
import type { MusePrompt } from "../types";

type AIQuestionChipsProps = {
  visible: boolean;
  batchKey: number;
  enterDelay: number;
  keyboardOffset: number;
  prompts: MusePrompt[];
  onQuestionChipTap: (insertText: string) => void;
};

export function AIQuestionChips({
  visible,
  batchKey,
  enterDelay,
  keyboardOffset,
  prompts,
  onQuestionChipTap,
}: AIQuestionChipsProps) {
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={`muse-batch-${batchKey}`}
          className="fixed left-0 right-0 z-[70] flex flex-col items-center gap-4 px-6"
          style={{ bottom: `${keyboardOffset + 102}px` }}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delayChildren: enterDelay, staggerChildren: 0.08, staggerDirection: -1 },
            },
            exit: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, staggerDirection: -1 } },
          }}
          data-testid="question-chips"
        >
          {prompts.map((chip) => (
            <motion.button
              key={chip.id}
              className={STYLE_TOKENS.questionChipButtonClass}
              style={STYLE_TOKENS.questionChipGlowStyle}
              whileTap={STYLE_TOKENS.questionChipTapStyle}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
                exit: {
                  opacity: 0,
                  y: 18,
                  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              onClick={() => onQuestionChipTap(chip.insert)}
              data-testid={`chip-question-${chip.id}`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-white/85" />
              <span
                className="text-white/95 font-medium text-base italic leading-[150%] tracking-[-0.176px]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {chip.label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
