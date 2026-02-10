import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Sparkles, Leaf } from "lucide-react";
import bgImage from "@assets/Home_(1)_1770656113412.png";

const PROMPTS = [
  "i'm thinking about",
  "i want to build",
  "i want to learn",
  "i'm curious about",
  "i want to create",
];

const STARTER_CHIPS = [
  "a music loop",
  "a portfolio piece",
  "something bold",
];

const QUESTION_CHIPS = [
  { label: "Who is it for?", stem: "It is for people who " },
  { label: "What's the twist?", stem: "The twist is that " },
  { label: "Why now?", stem: "Now is the right time because " },
];

const heavySpring = { type: "spring" as const, stiffness: 300, damping: 30 };

function CharacterAnimation({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const chars = text.split("");
  return (
    <span className="inline" aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.05,
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          onAnimationComplete={i === chars.length - 1 ? onComplete : undefined}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

function BreathingCursor({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          className="inline-block w-[2px] h-[1.1em] align-middle bg-white ml-[2px] mr-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: {
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [coldStartDone, setColdStartDone] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [isComposer, setIsComposer] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showAIChips, setShowAIChips] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [slotDirection, setSlotDirection] = useState(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pullStartY = useRef<number | null>(null);
  const pullY = useMotionValue(0);
  const pullOpacity = useTransform(pullY, [0, 80], [1, 0.3]);

  const currentPrompt = PROMPTS[promptIndex];

  const hasUserTyped = inputValue.length > currentPrompt.length;

  const handleColdStartComplete = useCallback(() => {
    setColdStartDone(true);
    setShowCursor(true);
  }, []);

  const handleTapToCompose = useCallback(() => {
    if (isComposer) return;
    setIsComposer(true);
    setShowCursor(false);
    setInputValue(currentPrompt);
    setShowAIChips(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = currentPrompt.length;
        textareaRef.current.selectionEnd = currentPrompt.length;
      }
    }, 600);
  }, [isComposer, currentPrompt]);

  const handleBack = useCallback(() => {
    setIsComposer(false);
    setInputValue("");
    setShowAIChips(false);
    setShowCursor(true);
  }, []);

  const cyclePrompt = useCallback(() => {
    setSlotDirection(1);
    setColdStartDone(false);
    setShowCursor(false);
    setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
    setTimeout(() => {
      setColdStartDone(true);
      setShowCursor(true);
    }, 50);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isComposer) return;
    pullStartY.current = e.touches[0].clientY;
  }, [isComposer]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isComposer || pullStartY.current === null) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) {
      pullY.set(Math.min(delta, 120));
      if (delta > 30) setIsPulling(true);
    }
  }, [isComposer, pullY]);

  const handleTouchEnd = useCallback(() => {
    if (isPulling && pullY.get() > 60) {
      cyclePrompt();
    }
    setIsPulling(false);
    pullStartY.current = null;
    animate(pullY, 0, { type: "spring", stiffness: 400, damping: 30 });
  }, [isPulling, pullY, cyclePrompt]);

  const handleChipTap = useCallback((chipText: string) => {
    setInputValue((prev) => {
      const needsSpace = prev.length > 0 && !prev.endsWith(" ");
      return prev + (needsSpace ? " " : "") + chipText;
    });
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.selectionStart = len;
        textareaRef.current.selectionEnd = len;
      }
    }, 50);
  }, []);

  const handleQuestionChipTap = useCallback((stem: string) => {
    setInputValue((prev) => prev + " " + stem);
    setShowAIChips(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.selectionStart = len;
        textareaRef.current.selectionEnd = len;
      }
    }, 50);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length < currentPrompt.length) {
      setInputValue(currentPrompt);
      return;
    }
    setInputValue(val);
    if (val.length > currentPrompt.length) {
      setShowAIChips(false);
    }
  }, [currentPrompt]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputValue]);

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden bg-black"
      style={{ touchAction: isComposer ? "auto" : "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        animate={{ opacity: isComposer ? 0.1 : 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        aria-hidden="true"
        data-testid="bg-image"
      />
      <div className="relative z-20 flex flex-col min-h-[100dvh]">
        <AnimatePresence>
          {isComposer && (
            <motion.button
              className="absolute top-4 left-4 z-30 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBack}
              data-testid="button-back"
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <motion.div
          className="flex-1 flex flex-col px-6"
          style={!isComposer ? { y: pullY, opacity: pullOpacity } : {}}
          animate={{
            paddingTop: isComposer ? "4.5rem" : "40vh",
          }}
          transition={{
            paddingTop: { type: "spring", stiffness: 200, damping: 28 },
          }}
        >
          {!isComposer && (
            <motion.div
              className="mb-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="text-base text-muted-foreground font-medium tracking-wide" data-testid="text-greeting">right now</span>
            </motion.div>
          )}

          {!isComposer ? (
            <motion.div
              className="cursor-pointer"
              onClick={handleTapToCompose}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleTapToCompose(); } }}
              data-testid="button-compose"
              role="button"
              tabIndex={0}
              aria-label={`Tap to start writing: ${currentPrompt}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={promptIndex}
                  initial={{ y: slotDirection * -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: slotDirection * 40, opacity: 0 }}
                  transition={heavySpring}
                >
                  <h1 className="text-3xl font-light tracking-tight text-white leading-tight" style={{ fontFamily: "'Roboto Serif', serif" }} data-testid="text-prompt">
                    {!coldStartDone && promptIndex === 0 ? (
                      <CharacterAnimation
                        text={currentPrompt}
                        onComplete={handleColdStartComplete}
                      />
                    ) : (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        onAnimationComplete={() => {
                          if (!coldStartDone) {
                            setColdStartDone(true);
                            setShowCursor(true);
                          }
                        }}
                        className="font-light">
                        {currentPrompt}
                      </motion.span>
                    )}
                    <BreathingCursor visible={showCursor} />
                  </h1>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="relative"
              initial={false}
            >
              <motion.span
                className="block text-sm text-muted-foreground font-medium mb-2 tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Right now,
              </motion.span>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                className="w-full bg-transparent text-2xl font-light text-white tracking-tight resize-none outline-none border-none leading-snug"
                style={{ fontFamily: "'Roboto Serif', serif", minHeight: "3rem" }}
                autoFocus
                data-testid="input-composer"
                aria-label="Write your idea"
              />
            </motion.div>
          )}

          {!isComposer && isPulling && (
            <motion.div
              className="mt-4 flex items-center gap-1.5 text-muted-foreground"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 0.6, y: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
              <span className="text-xs font-medium">Pull to refresh prompt</span>
            </motion.div>
          )}

          <AnimatePresence>
            {isComposer && !hasUserTyped && !showAIChips && (
              <motion.div
                className="flex flex-wrap gap-2 mt-5"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  visible: { transition: { staggerChildren: 0.08 } },
                  exit: { transition: { staggerChildren: 0.04 } },
                }}
                data-testid="starter-chips"
              >
                {STARTER_CHIPS.map((chip) => (
                  <motion.button
                    key={chip}
                    className="px-3.5 py-2 rounded-md bg-muted text-sm text-muted-foreground font-medium hover-elevate active-elevate-2 transition-colors"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                      exit: { opacity: 0, scale: 0.9 },
                    }}
                    transition={{ duration: 0.25 }}
                    onClick={() => handleChipTap(chip)}
                    data-testid={`chip-starter-${chip.replace(/\s+/g, "-")}`}
                  >
                    {chip}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isComposer && showAIChips && !hasUserTyped && (
              <motion.div
                className="flex flex-col gap-2 mt-5"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  visible: { transition: { staggerChildren: 0.08 } },
                  exit: { transition: { staggerChildren: 0.04 } },
                }}
                data-testid="question-chips"
              >
                {QUESTION_CHIPS.map((chip) => (
                  <motion.button
                    key={chip.label}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-primary/10 text-sm text-primary font-medium text-left hover-elevate active-elevate-2 transition-colors"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                      exit: { opacity: 0, scale: 0.9 },
                    }}
                    transition={{ duration: 0.25 }}
                    onClick={() => handleQuestionChipTap(chip.stem)}
                    data-testid={`chip-question-${chip.label.replace(/\s+/g, "-")}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    {chip.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {isComposer && (
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              data-testid="toolbar"
            >
              <div className="flex items-center justify-between px-4 py-3 backdrop-blur-md bg-background/80 dark:bg-background/70 border-t border-border/50">
                <motion.button
                  className="flex items-center justify-center w-10 h-10 rounded-md text-primary hover-elevate active-elevate-2"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowAIChips((prev) => !prev)}
                  data-testid="button-ai-sparkle"
                  aria-label="AI suggestions"
                >
                  <Sparkles className="w-5 h-5" />
                </motion.button>

                <motion.button
                  className="flex items-center gap-2 px-5 min-h-9 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover-elevate active-elevate-2"
                  whileTap={{ scale: 0.95 }}
                  data-testid="button-finish"
                  aria-label="Plant your idea"
                >
                  <Leaf className="w-4 h-4" />
                  <span>Plant</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isComposer && (
          <motion.div
            className="pb-8 px-6 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <motion.button
              className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium"
              onClick={cyclePrompt}
              whileTap={{ scale: 0.95 }}
              data-testid="button-cycle-prompt"
              aria-label="Next prompt"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Shuffle prompt
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
