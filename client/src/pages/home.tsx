import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, type MotionValue } from "framer-motion";
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

const pullMaxDistance = 120;
const gatherSpring = { type: "spring" as const, stiffness: 120, damping: 20 };
const cursorFadeRange = [0, 20] as const;
const introBaseDelay = 0.5;
const introStagger = 0.03;
const introDuration = 0.3;

type ScatterTarget = {
  y: number;
  rotate: number;
};

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateScatterTargets(length: number) {
  return Array.from({ length }, () => ({
    y: randomRange(10, 60),
    rotate: randomRange(-15, 15),
  }));
}

function expandScatterTargets(targets: ScatterTarget[], length: number) {
  if (targets.length >= length) {
    return targets.slice(0, length);
  }
  const extras = generateScatterTargets(length - targets.length);
  return [...targets, ...extras];
}

type BreathingCursorProps = {
  visible: boolean;
  opacity?: MotionValue<number>;
};

function BreathingCursor({ visible, opacity }: BreathingCursorProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          className="inline-block align-middle"
          style={opacity ? { opacity } : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            className="inline-block w-[2px] h-[1.1em] align-middle bg-white ml-[3px] mr-[2px] -translate-y-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              opacity: {
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

type ScrabbleCharProps = {
  char: string;
  index: number;
  target: ScatterTarget;
  pullY: MotionValue<number>;
  introActive: boolean;
  fadeInExtra: boolean;
};

function ScrabbleChar({ char, index, target, pullY, introActive, fadeInExtra }: ScrabbleCharProps) {
  const y = useTransform(pullY, [0, pullMaxDistance], [0, target.y]);
  const rotate = useTransform(pullY, [0, pullMaxDistance], [0, target.rotate]);
  const opacity = useTransform(pullY, [0, pullMaxDistance], [1, 0.2]);

  const introProps = introActive
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: {
          delay: introBaseDelay + index * introStagger,
          duration: introDuration,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      }
    : {};

  const extraProps = !introActive && fadeInExtra
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.4, ease: "easeOut" },
      }
    : {};

  return (
    <motion.span
      key={`${char}-${index}`}
      className="inline-flex font-light"
      style={{
        y: introActive ? undefined : y,
        rotate: introActive ? undefined : rotate,
        opacity: introActive ? undefined : opacity,
        willChange: "transform",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
      }}
      {...introProps}
      {...extraProps}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

export default function Home() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(false);
  const [isComposer, setIsComposer] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showAIChips, setShowAIChips] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullSession, setPullSession] = useState(0);
  const [scatterTargets, setScatterTargets] = useState<ScatterTarget[]>(
    () => generateScatterTargets(PROMPTS[0].length),
  );
  const [newCharStartIndex, setNewCharStartIndex] = useState<number | null>(null);
  const [introActive, setIntroActive] = useState(true);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pullStartY = useRef<number | null>(null);
  const isMouseDragging = useRef(false);
  const pullY = useMotionValue(0);
  const pullOpacity = useTransform(pullY, [0, 80], [1, 0.3]);
  const cursorOpacity = useTransform(pullY, cursorFadeRange, [1, 0]);
  const skipScatterSyncRef = useRef(false);

  const currentPrompt = PROMPTS[promptIndex];
  const promptChars = currentPrompt.split("");
  const sessionScatterTargets = useMemo(
    () => generateScatterTargets(currentPrompt.length),
    [currentPrompt.length, pullSession],
  );

  const hasUserTyped = inputValue.length > currentPrompt.length;

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
    const nextIndex = (promptIndex + 1) % PROMPTS.length;
    const nextPrompt = PROMPTS[nextIndex];
    const nextLength = nextPrompt.length;
    const currentLength = scatterTargets.length;
    setShowCursor(false);
    skipScatterSyncRef.current = true;
    if (nextLength > currentLength) {
      setNewCharStartIndex(currentLength);
    } else {
      setNewCharStartIndex(null);
    }
    setScatterTargets((prev) => expandScatterTargets(prev, nextPrompt.length));
    setPromptIndex(nextIndex);
    setTimeout(() => {
      setShowCursor(true);
    }, 600);
  }, [promptIndex, scatterTargets.length]);

  useEffect(() => {
    if (skipScatterSyncRef.current) {
      skipScatterSyncRef.current = false;
      return;
    }
    setScatterTargets(sessionScatterTargets);
  }, [sessionScatterTargets]);

  useEffect(() => {
    if (newCharStartIndex === null) return;
    const timeout = setTimeout(() => setNewCharStartIndex(null), 500);
    return () => clearTimeout(timeout);
  }, [newCharStartIndex]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isComposer) return;
    pullStartY.current = e.touches[0].clientY;
    setPullSession((prev) => prev + 1);
  }, [isComposer]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isComposer || pullStartY.current === null) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) {
      pullY.set(Math.min(delta, pullMaxDistance));
      if (delta > 30) setIsPulling(true);
    }
  }, [isComposer, pullY]);

  const handleTouchEnd = useCallback(() => {
    if (isPulling && pullY.get() > 60) {
      cyclePrompt();
    }
    setIsPulling(false);
    pullStartY.current = null;
    animate(pullY, 0, gatherSpring);
  }, [isPulling, pullY, cyclePrompt]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isComposer) return;
    pullStartY.current = e.clientY;
    isMouseDragging.current = true;
    setPullSession((prev) => prev + 1);
  }, [isComposer]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isComposer || !isMouseDragging.current || pullStartY.current === null) return;
    const delta = e.clientY - pullStartY.current;
    if (delta > 0) {
      pullY.set(Math.min(delta, pullMaxDistance));
      if (delta > 30) setIsPulling(true);
    }
  }, [isComposer, pullY]);

  const handleMouseUp = useCallback(() => {
    if (!isMouseDragging.current) return;
    if (isPulling && pullY.get() > 60) {
      cyclePrompt();
    }
    setIsPulling(false);
    pullStartY.current = null;
    isMouseDragging.current = false;
    animate(pullY, 0, gatherSpring);
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

  useEffect(() => {
    if (!isComposer) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyWidth = document.body.style.width;
    const previousBodyTop = document.body.style.top;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.width = previousBodyWidth;
      document.body.style.top = previousBodyTop;
      window.scrollTo(0, scrollY);
    };
  }, [isComposer]);

  useEffect(() => {
    if (!isComposer) return;
    const preventTouchMove = (event: TouchEvent) => {
      if (event.cancelable) {
        event.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventTouchMove, { passive: false });
    return () => {
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isComposer]);

  useEffect(() => {
    if (!isComposer) {
      setLockedHeight(null);
      return;
    }
    setLockedHeight(window.innerHeight);
  }, [isComposer]);

  useEffect(() => {
    const previousBackground = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#000";
    return () => {
      document.body.style.backgroundColor = previousBackground;
    };
  }, []);

  useEffect(() => {
    const introTotalMs =
      (introBaseDelay +
        Math.max(promptChars.length - 1, 0) * introStagger +
        introDuration) *
      1000;
    const introTimeout = setTimeout(() => {
      setIntroActive(false);
      setShowCursor(true);
    }, introTotalMs);
    return () => clearTimeout(introTimeout);
  }, [promptChars.length]);



  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black"
      style={{
        touchAction: isComposer ? "auto" : "none",
        height: lockedHeight ? `${lockedHeight}px` : "100vh",
        overscrollBehavior: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <motion.img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        aria-hidden="true"
        data-testid="bg-image"
      />
      <div className="relative z-20 h-full">
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

        <AnimatePresence mode="wait">
          {!isComposer && (
            <motion.div
              key="home"
              className="absolute inset-0 flex flex-col items-start justify-center px-[30px]"
              style={{ opacity: pullOpacity }}
            >
              <motion.div
                layoutId="right-now"
                layout="position"
                transition={{ type: "spring", stiffness: 110, damping: 20 }}
                className="text-white font-medium leading-[120%] tracking-[-0.16px] mb-1"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px" }}
                data-testid="text-greeting"
              >
                right now
              </motion.div>

              <motion.div
                layoutId="prompt-line"
                layout="position"
                transition={{ type: "spring", stiffness: 110, damping: 20 }}
                className="cursor-pointer"
                onClick={handleTapToCompose}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleTapToCompose(); } }}
                data-testid="button-compose"
                role="button"
                tabIndex={0}
                aria-label={`Tap to start writing: ${currentPrompt}`}
              >
                <h1
                  className="text-[32px] font-normal text-white leading-[38.4px] tracking-[0] flex items-start"
                  style={{
                    fontFamily: "'Roboto Serif', serif",
                    fontKerning: "none",
                    fontVariantLigatures: "none",
                    letterSpacing: "0px",
                    willChange: "transform",
                  }}
                  data-testid="text-prompt"
                >
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
            </motion.div>
          )}

          {isComposer && (
            <motion.div key="composer" className="absolute inset-0">
              <div className="relative z-10 pt-[117px] px-[30px]">
                <motion.div
                  layoutId="right-now"
                  layout="position"
                  transition={{ type: "spring", stiffness: 110, damping: 20 }}
                  className="text-white font-medium leading-[120%] tracking-[-0.14px] mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}
                >
                  right now
                </motion.div>
                <motion.div
                  layoutId="prompt-line"
                  layout="position"
                  transition={{ type: "spring", stiffness: 110, damping: 20 }}
                  className="relative"
                >
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-white text-[24px] font-normal leading-[120%] tracking-[-0.24px] border-none outline-none resize-none overflow-hidden touch-none"
                    style={{ fontFamily: "'Roboto Serif', serif" }}
                    autoFocus
                    data-testid="input-composer"
                    aria-label="Write your idea"
                  />
                </motion.div>

                <AnimatePresence>
                  {isComposer && !hasUserTyped && !showAIChips && (
                    <motion.div
                      className="flex flex-col items-center gap-4 mt-10 w-full"
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
                          className="inline-flex h-12 px-5 items-center justify-center rounded-3xl bg-white/10 hover:bg-white/20 transition-colors"
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 },
                            exit: { opacity: 0, scale: 0.9 },
                          }}
                          transition={{ duration: 0.25 }}
                          onClick={() => handleChipTap(chip)}
                          data-testid={`chip-starter-${chip.replace(/\s+/g, "-")}`}
                        >
                          <span className="text-white/60 font-medium text-base leading-[150%] tracking-[-0.176px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {chip}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isComposer && showAIChips && !hasUserTyped && (
                    <motion.div
                      className="flex flex-col items-center gap-2 mt-5 w-full"
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
                          className="inline-flex h-12 px-5 items-center justify-center gap-2 rounded-3xl bg-white/10 hover:bg-white/20 transition-colors"
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 },
                            exit: { opacity: 0, scale: 0.9 },
                          }}
                          transition={{ duration: 0.25 }}
                          onClick={() => handleQuestionChipTap(chip.stem)}
                          data-testid={`chip-question-${chip.label.replace(/\s+/g, "-")}`}
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-white" />
                          <span className="text-white/60 font-medium text-base italic leading-[150%] tracking-[-0.176px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {chip.label}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
      </div>
    </div>
  );
}
