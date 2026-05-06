import { motion } from "framer-motion";
import { Sparkles, X, RefreshCw } from "lucide-react";

type ComposerToolbarProps = {
  showAIChips: boolean;
  disableFinish?: boolean;
  keyboardOffset: number;
  onOpenAiMode: () => void;
  onCloseAiMode: () => void;
  onRefreshAiPrompts: () => void;
  onFinish: () => void;
};

export function ComposerToolbar({
  showAIChips,
  disableFinish = false,
  keyboardOffset,
  onOpenAiMode,
  onCloseAiMode,
  onRefreshAiPrompts,
  onFinish,
}: ComposerToolbarProps) {
  return (
    <motion.div
      className={`fixed left-0 right-0 ${showAIChips ? "z-[75]" : "z-50"}`}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      data-testid="toolbar"
      style={{ bottom: `${keyboardOffset}px` }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-transparent border-t border-transparent md:bg-background/80 md:dark:bg-background/70 md:border-border/50">
        {!showAIChips && (
          <motion.button
            className="flex items-center justify-center w-12 h-12 rounded-3xl bg-white/10 text-white hover-elevate active-elevate-2 md:bg-transparent md:text-primary"
            whileTap={{ scale: 0.92 }}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onClick={onOpenAiMode}
            data-testid="button-ai-sparkle"
            aria-label="AI suggestions"
          >
            <Sparkles className="w-5 h-5" />
          </motion.button>
        )}

        {showAIChips && (
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-[30px] flex items-center gap-4">
            <motion.button
              className="flex items-center justify-center w-12 h-12 rounded-3xl bg-black/10 text-black hover-elevate active-elevate-2"
              whileTap={{ scale: 0.92 }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={onCloseAiMode}
              data-testid="button-ai-close"
              aria-label="Close AI mode"
            >
              <X className="w-4 h-4" strokeWidth={2.6} />
            </motion.button>
            <motion.button
              className="flex items-center justify-center w-12 h-12 rounded-3xl bg-black/10 text-black hover-elevate active-elevate-2"
              whileTap={{ scale: 0.92 }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={onRefreshAiPrompts}
              data-testid="button-ai-refresh"
              aria-label="Refresh AI prompts"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={2.6} />
            </motion.button>
          </div>
        )}

        {!showAIChips && (
          <motion.button
            className="flex items-center gap-2 px-5 h-11 rounded-3xl bg-white/10 text-white text-base font-semibold hover-elevate active-elevate-2 md:bg-primary md:text-primary-foreground"
            whileTap={{ scale: 0.95 }}
            onClick={onFinish}
            disabled={disableFinish}
            data-testid="button-finish"
            aria-label="Plant your idea"
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Finish</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
