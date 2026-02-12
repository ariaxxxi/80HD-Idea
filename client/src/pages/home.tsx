import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, type MotionValue } from "framer-motion";
import { Sparkles, Leaf, X, RefreshCw } from "lucide-react";
import bgImage from "@assets/Home_(1)_1770656113412.png";
import aiBgImage from "@assets/AI-BG.png";

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

type MusePrompt = {
  id: string;
  label: string;
  insert: string;
};

const CURATED_MUSE_PROMPTS: MusePrompt[] = [
  { id: "who-for", label: "Who is it for?", insert: "\nIt is designed for people who " },
  { id: "twist", label: "What's the twist?", insert: "\nThe unique twist is that " },
  { id: "vibe", label: "What's the vibe?", insert: "\nThe visual aesthetic feels like " },
  { id: "first-step", label: "First step?", insert: "\nThe very first thing to do is " },
  { id: "core-problem", label: "Core problem?", insert: "\nThe main problem this solves is " },
  { id: "moment", label: "When does it click?", insert: "\nThis feels most useful when " },
  { id: "emotion", label: "What should it feel like?", insert: "\nI want people to feel " },
  { id: "risk", label: "Biggest risk?", insert: "\nThe biggest risk to watch is " },
  { id: "proof", label: "How to test it fast?", insert: "\nA quick way to validate this is " },
  { id: "scope-cut", label: "What can we cut?", insert: "\nTo keep it simple, we can remove " },
];

function generatePrompts(currentText: string, excludedIds: string[] = []): MusePrompt[] {
  const lower = currentText.toLowerCase();
  const orderedIds: string[] = [];

  if (/user|audience|for people|customer/.test(lower)) {
    orderedIds.push("twist", "vibe", "first-step", "moment", "proof");
  } else if (/visual|style|look|aesthetic|brand/.test(lower)) {
    orderedIds.push("vibe", "emotion", "who-for", "twist", "scope-cut");
  } else if (/build|ship|step|start|plan/.test(lower)) {
    orderedIds.push("first-step", "proof", "risk", "who-for", "twist");
  } else {
    orderedIds.push("who-for", "twist", "vibe", "first-step", "core-problem", "proof");
  }

  orderedIds.push("core-problem", "moment", "emotion", "risk", "scope-cut");

  const promptsById = new Map(CURATED_MUSE_PROMPTS.map((prompt) => [prompt.id, prompt]));
  const selected: MusePrompt[] = [];

  for (const id of orderedIds) {
    const prompt = promptsById.get(id);
    if (!prompt) continue;
    if (excludedIds.includes(prompt.id)) continue;
    if (selected.some((item) => item.id === prompt.id)) continue;
    selected.push(prompt);
    if (selected.length === 3) break;
  }

  if (selected.length < 3) {
    for (const prompt of CURATED_MUSE_PROMPTS) {
      if (excludedIds.includes(prompt.id)) continue;
      if (selected.some((item) => item.id === prompt.id)) continue;
      selected.push(prompt);
      if (selected.length === 3) break;
    }
  }

  if (selected.length < 3) {
    for (const prompt of CURATED_MUSE_PROMPTS) {
      if (selected.some((item) => item.id === prompt.id)) continue;
      selected.push(prompt);
      if (selected.length === 3) break;
    }
  }

  return selected;
}

const pullMaxDistance = 120;
const gatherSpring = { type: "spring" as const, stiffness: 120, damping: 20 };
const cursorFadeRange = [0, 20];
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
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isReturningHome, setIsReturningHome] = useState(false);
  const [musePrompts, setMusePrompts] = useState<MusePrompt[]>(() =>
    generatePrompts(""),
  );
  const [musePromptBatch, setMusePromptBatch] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerScrollRef = useRef<HTMLDivElement>(null);
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

  const focusComposerInput = useCallback(() => {
    if (!textareaRef.current) return;
    textareaRef.current.focus({ preventScroll: true });
    const len = textareaRef.current.value.length;
    textareaRef.current.selectionStart = len;
    textareaRef.current.selectionEnd = len;
  }, []);

  const dismissComposerKeyboard = useCallback(() => {
    textareaRef.current?.blur();
    const activeEl = document.activeElement as HTMLElement | null;
    activeEl?.blur?.();
  }, []);

  const handleTapToCompose = useCallback(() => {
    if (isComposer) return;
    setIsComposer(true);
    setIsReturningHome(false);
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
    setIsReturningHome(true);
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
    setInputValue((prev) => prev + stem);
    setShowAIChips(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        const len = textareaRef.current.value.length;
        textareaRef.current.selectionStart = len;
        textareaRef.current.selectionEnd = len;
      }
      if (composerScrollRef.current) {
        composerScrollRef.current.scrollTo({
          top: composerScrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  }, []);

  const handleOpenAiMode = useCallback(() => {
    setMusePrompts(generatePrompts(inputValue));
    setMusePromptBatch((prev) => prev + 1);
    setShowAIChips(true);
    setTimeout(() => dismissComposerKeyboard(), 0);
  }, [dismissComposerKeyboard, inputValue]);

  const handleCloseAiMode = useCallback(() => {
    setShowAIChips(false);
  }, []);

  const handleRefreshAiPrompts = useCallback(() => {
    setMusePrompts((prev) => {
      const prevIds = prev.map((prompt) => prompt.id);
      return generatePrompts(inputValue, prevIds);
    });
    setMusePromptBatch((prev) => prev + 1);
    setTimeout(() => dismissComposerKeyboard(), 0);
  }, [dismissComposerKeyboard, inputValue]);

  const handleComposerInputInteract = useCallback(() => {
    if (!showAIChips) return;
    setShowAIChips(false);
    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus({ preventScroll: true });
      const len = textareaRef.current.value.length;
      textareaRef.current.selectionStart = len;
      textareaRef.current.selectionEnd = len;
    });
  }, [showAIChips]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
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
    if (!isComposer) {
      setKeyboardOffset(0);
      return;
    }
    const updateOffset = () => {
      const vv = window.visualViewport;
      if (!vv) {
        setKeyboardOffset(0);
        return;
      }
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
    };
    updateOffset();
    window.visualViewport?.addEventListener("resize", updateOffset);
    window.visualViewport?.addEventListener("scroll", updateOffset);
    window.addEventListener("orientationchange", updateOffset);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateOffset);
      window.visualViewport?.removeEventListener("scroll", updateOffset);
      window.removeEventListener("orientationchange", updateOffset);
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

  useEffect(() => {
    if (!isReturningHome) return;
    const timer = setTimeout(() => setIsReturningHome(false), 500);
    return () => clearTimeout(timer);
  }, [isReturningHome]);

  useEffect(() => {
    if (!isComposer) return;
    const scrollEl = composerScrollRef.current;
    const textareaEl = textareaRef.current;
    if (!scrollEl || !textareaEl) return;
    const raf = requestAnimationFrame(() => {
      const caretBottom = textareaEl.offsetTop + textareaEl.offsetHeight;
      const visibleBottom = scrollEl.scrollTop + scrollEl.clientHeight - (keyboardOffset + 96);
      if (caretBottom > visibleBottom) {
        scrollEl.scrollTo({
          top: Math.max(0, caretBottom - scrollEl.clientHeight + keyboardOffset + 96),
          behavior: "smooth",
        });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [inputValue, isComposer, keyboardOffset]);

  useEffect(() => {
    if (!showAIChips) return;
    dismissComposerKeyboard();
  }, [showAIChips, dismissComposerKeyboard]);



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
      <AnimatePresence>
        {isComposer && showAIChips && (
          <motion.img
            key="ai-mode-bg"
            src={aiBgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            aria-hidden="true"
            data-testid="bg-image-ai-mode"
          />
        )}
      </AnimatePresence>
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
              {isReturningHome ? (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="text-white font-medium leading-[120%] tracking-[-0.16px] mb-1"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px" }}
                    data-testid="text-greeting"
                  >
                    right now
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
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
                </>
              ) : (
                <>
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
                </>
              )}
            </motion.div>
          )}

          {isComposer && (
            <motion.div key="composer" className="absolute inset-0">
              <div className="relative z-10 h-full pt-[60px] px-[30px] flex flex-col">
                <div
                  ref={composerScrollRef}
                  className="relative flex-1 overflow-y-auto pb-24"
                  style={{
                    paddingBottom: `${keyboardOffset + 120}px`,
                    scrollPaddingBottom: `${keyboardOffset + 120}px`,
                  }}
                >
                  <div className="pointer-events-none absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black to-transparent z-10" />

                  <motion.div
                    layoutId="prompt-line"
                    layout="position"
                    transition={{ type: "spring", stiffness: 110, damping: 20 }}
                    className="relative pt-4"
                  >
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onFocus={handleComposerInputInteract}
                      onPointerDown={handleComposerInputInteract}
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

                  <AnimatePresence>
                    {isComposer && !hasUserTyped && !showAIChips && (
                      <motion.div
                        className="flex flex-col items-center gap-4 mt-10 w-full"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      variants={{
                        visible: { transition: { delayChildren: 1, staggerChildren: 0.08 } },
                        exit: { transition: { staggerChildren: 0.04 } },
                      }}
                      data-testid="starter-chips"
                    >
                        {STARTER_CHIPS.map((chip) => (
                          <motion.button
                            key={chip}
                            className="inline-flex h-11 px-5 items-center justify-center rounded-3xl bg-white/10 hover:bg-white/20 transition-colors"
                            onMouseDown={(e) => e.preventDefault()}
                            onTouchStart={(e) => e.preventDefault()}
                          variants={{
                            hidden: { opacity: 0, y: 18 },
                            visible: { opacity: 1, y: 0 },
                            exit: {
                              opacity: 0,
                              scale: 0.7,
                              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                            },
                          }}
                          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                          onClick={() => handleChipTap(chip)}
                          data-testid={`chip-starter-${chip.replace(/\s+/g, "-")}`}
                        >
                            <span className="text-white/50 font-medium text-base leading-[150%] tracking-[-0.176px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              {chip}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                <AnimatePresence mode="wait">
                  {isComposer && showAIChips && (
                    <motion.div
                      key={`muse-batch-${musePromptBatch}`}
                      className="fixed left-0 right-0 z-[55] flex flex-col items-center gap-6 px-6"
                      style={{ bottom: `${keyboardOffset + 102}px` }}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { delayChildren: 1, staggerChildren: 0.08, staggerDirection: -1 },
                        },
                        exit: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, staggerDirection: -1 } },
                      }}
                      data-testid="question-chips"
                    >
                      {musePrompts.map((chip) => (
                        <motion.button
                          key={chip.id}
                          className="inline-flex h-12 px-5 items-center justify-center gap-2 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-[28px] backdrop-saturate-125 hover:bg-white/15 transition-colors"
                          style={{ boxShadow: "0 0 24px rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.22)" }}
                          whileTap={{
                            scale: 0.98,
                            backgroundColor: "rgba(255,255,255,0.2)",
                            boxShadow: "0 0 40px rgba(255,255,255,0.35), 0 10px 28px rgba(0,0,0,0.24)",
                          }}
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
                          onClick={() => handleQuestionChipTap(chip.insert)}
                          data-testid={`chip-question-${chip.id}`}
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-white/85" />
                          <span className="text-white/95 font-medium text-base italic leading-[150%] tracking-[-0.176px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              {chip.label}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isComposer && (
            <motion.div
              className="fixed left-0 right-0 z-50"
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
                    onClick={handleOpenAiMode}
                    data-testid="button-ai-sparkle"
                    aria-label="AI suggestions"
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.button>
                )}

                {showAIChips && (
                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-[30px] flex items-center gap-4">
                    <motion.button
                      className="flex items-center justify-center w-12 h-12 rounded-3xl bg-white/10 text-white hover-elevate active-elevate-2"
                      whileTap={{ scale: 0.92 }}
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                      onClick={handleCloseAiMode}
                      data-testid="button-ai-close"
                      aria-label="Close AI mode"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      className="flex items-center justify-center w-12 h-12 rounded-3xl bg-white/10 text-white hover-elevate active-elevate-2"
                      whileTap={{ scale: 0.92 }}
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                      onClick={handleRefreshAiPrompts}
                      data-testid="button-ai-refresh"
                      aria-label="Refresh AI prompts"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}

                {!showAIChips && (
                  <motion.button
                    className="flex items-center gap-2 px-5 h-11 rounded-3xl bg-white/10 text-white text-sm font-semibold hover-elevate active-elevate-2 md:bg-primary md:text-primary-foreground"
                    whileTap={{ scale: 0.95 }}
                    data-testid="button-finish"
                    aria-label="Plant your idea"
                  >
                    <span>Finish</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
