import { motion } from "framer-motion";
import type { ChangeEvent, RefObject } from "react";
import { STARTER_CHIPS } from "../constants/prompts";
import type { MusePrompt } from "../types";
import { StarterChips } from "./StarterChips";
import { AIQuestionChips } from "./AIQuestionChips";

type ComposerPanelProps = {
  composerScrollRef: RefObject<HTMLDivElement>;
  textareaRef: RefObject<HTMLTextAreaElement>;
  inputValue: string;
  keyboardOffset: number;
  hasUserTyped: boolean;
  showAIChips: boolean;
  musePromptBatch: number;
  aiChipEnterDelay: number;
  musePrompts: MusePrompt[];
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onComposerInputInteract: () => void;
  onStarterChipTap: (chipText: string) => void;
  onQuestionChipTap: (insertText: string) => void;
};

export function ComposerPanel({
  composerScrollRef,
  textareaRef,
  inputValue,
  keyboardOffset,
  hasUserTyped,
  showAIChips,
  musePromptBatch,
  aiChipEnterDelay,
  musePrompts,
  onInputChange,
  onComposerInputInteract,
  onStarterChipTap,
  onQuestionChipTap,
}: ComposerPanelProps) {
  return (
    <motion.div key="composer" className="absolute inset-0">
      <div className="relative h-full pt-[60px] px-[30px] flex flex-col">
        <div
          ref={composerScrollRef}
          className="relative flex-1 overflow-y-auto pb-24"
          style={{
            paddingBottom: `${keyboardOffset + 120}px`,
            scrollPaddingBottom: `${keyboardOffset + 120}px`,
          }}
        >
          <div className="pointer-events-none absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#101010] to-transparent z-10" />

          <motion.div
            layoutId="prompt-line"
            layout="position"
            transition={{ type: "spring", stiffness: 110, damping: 20 }}
            className="relative pt-4"
          >
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={onInputChange}
              onFocus={onComposerInputInteract}
              onPointerDown={onComposerInputInteract}
              className="w-full min-h-full bg-transparent text-white text-[24px] font-normal leading-relaxed tracking-[-0.24px] border-none outline-none focus:outline-none focus:ring-0 resize-none"
              style={{
                fontFamily: "'Roboto Serif', serif",
                scrollPaddingBottom: `${keyboardOffset + 120}px`,
              }}
              autoFocus
              data-testid="input-composer"
              aria-label="Write your idea"
            />
          </motion.div>

          <StarterChips
            visible={!hasUserTyped && !showAIChips}
            chips={STARTER_CHIPS}
            onChipTap={onStarterChipTap}
          />

          <AIQuestionChips
            visible={showAIChips}
            batchKey={musePromptBatch}
            enterDelay={aiChipEnterDelay}
            keyboardOffset={keyboardOffset}
            prompts={musePrompts}
            onQuestionChipTap={onQuestionChipTap}
          />
        </div>
      </div>
    </motion.div>
  );
}
