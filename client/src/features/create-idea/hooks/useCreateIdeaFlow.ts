import { useState, useRef, useCallback, useEffect, useMemo, useReducer, type ChangeEvent, type MouseEvent, type TouchEvent } from "react";
import { animate, useMotionValue, useTransform } from "framer-motion";
import { PROMPTS } from "../constants/prompts";
import {
  cursorFadeRange,
  gatherSpring,
  introBaseDelay,
  introDuration,
  introStagger,
  pullMaxDistance,
} from "../constants/animation";
import { generatePrompts } from "../lib/generatePrompts";
import { expandScatterTargets, generateScatterTargets } from "../lib/scatterTargets";
import { useBodyScrollLock } from "./useBodyScrollLock";
import { useKeyboardOffset } from "./useKeyboardOffset";
import { useLockedViewportHeight } from "./useLockedViewportHeight";
import { useComposerCaretVisibility } from "./useComposerCaretVisibility";
import { ideaComposerReducer, initialIdeaComposerState } from "../state/ideaComposerReducer";
import type { MusePrompt, ScatterTarget } from "../types";

export function useCreateIdeaFlow() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isPulling, setIsPulling] = useState(false);
  const [pullSession, setPullSession] = useState(0);
  const [scatterTargets, setScatterTargets] = useState<ScatterTarget[]>(
    () => generateScatterTargets(PROMPTS[0].length),
  );
  const [newCharStartIndex, setNewCharStartIndex] = useState<number | null>(null);
  const [introActive, setIntroActive] = useState(true);
  const [showPullHint, setShowPullHint] = useState(true);
  const [musePrompts, setMusePrompts] = useState<MusePrompt[]>(() =>
    generatePrompts(""),
  );
  const [musePromptBatch, setMusePromptBatch] = useState(0);
  const [aiChipEnterDelay, setAiChipEnterDelay] = useState(2);
  const [composerState, dispatchComposer] = useReducer(
    ideaComposerReducer,
    initialIdeaComposerState,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerScrollRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number | null>(null);
  const isMouseDragging = useRef(false);
  const pullY = useMotionValue(0);
  const pullOpacity = useTransform(pullY, [0, 80], [1, 0.3]);
  const cursorOpacity = useTransform(pullY, cursorFadeRange, [1, 0]);
  const skipScatterSyncRef = useRef(false);

  const isComposer = composerState.screen === "composer";
  const showAIChips = composerState.composerMode === "ai";
  const isReturningHome = composerState.isReturningHome;
  const keyboardOffset = useKeyboardOffset(isComposer);
  const lockedHeight = useLockedViewportHeight(isComposer);

  const currentPrompt = PROMPTS[promptIndex];
  const promptChars = currentPrompt.split("");
  const sessionScatterTargets = useMemo(
    () => generateScatterTargets(currentPrompt.length),
    [currentPrompt.length, pullSession],
  );

  const hasUserTyped = inputValue.length > currentPrompt.length;

  const dismissComposerKeyboard = useCallback(() => {
    textareaRef.current?.blur();
    const activeEl = document.activeElement as HTMLElement | null;
    activeEl?.blur?.();
  }, []);

  const handleTapToCompose = useCallback(() => {
    if (isComposer) return;
    dispatchComposer({ type: "OPEN_COMPOSER" });
    setShowCursor(false);
    setInputValue(currentPrompt);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = currentPrompt.length;
        textareaRef.current.selectionEnd = currentPrompt.length;
      }
    }, 600);
  }, [isComposer, currentPrompt]);

  const handleBack = useCallback(() => {
    dispatchComposer({ type: "CLOSE_COMPOSER" });
    setInputValue("");
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

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (isComposer) return;
    setShowPullHint(false);
    pullStartY.current = e.touches[0].clientY;
    setPullSession((prev) => prev + 1);
  }, [isComposer]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
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

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (isComposer) return;
    setShowPullHint(false);
    pullStartY.current = e.clientY;
    isMouseDragging.current = true;
    setPullSession((prev) => prev + 1);
  }, [isComposer]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
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
    dispatchComposer({ type: "CLOSE_AI" });

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
    setAiChipEnterDelay(2);
    dispatchComposer({ type: "OPEN_AI" });
    setTimeout(() => dismissComposerKeyboard(), 0);
  }, [dismissComposerKeyboard, inputValue]);

  const handleCloseAiMode = useCallback(() => {
    dispatchComposer({ type: "CLOSE_AI" });
    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus({ preventScroll: true });
      const len = textareaRef.current.value.length;
      textareaRef.current.selectionStart = len;
      textareaRef.current.selectionEnd = len;
    });
  }, []);

  const handleRefreshAiPrompts = useCallback(() => {
    setMusePrompts((prev) => {
      const prevIds = prev.map((prompt) => prompt.id);
      return generatePrompts(inputValue, prevIds);
    });
    setMusePromptBatch((prev) => prev + 1);
    setAiChipEnterDelay(0.5);
    setTimeout(() => dismissComposerKeyboard(), 0);
  }, [dismissComposerKeyboard, inputValue]);

  const handleComposerInputInteract = useCallback(() => {
    if (!showAIChips) return;
    dispatchComposer({ type: "CLOSE_AI" });

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus({ preventScroll: true });
      const len = textareaRef.current.value.length;
      textareaRef.current.selectionStart = len;
      textareaRef.current.selectionEnd = len;
    });
  }, [showAIChips]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.length > currentPrompt.length) {
      dispatchComposer({ type: "CLOSE_AI" });
    }
  }, [currentPrompt]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  useBodyScrollLock(isComposer);
  useComposerCaretVisibility({
    isComposer,
    inputValue,
    keyboardOffset,
    composerScrollRef,
    textareaRef,
  });

  useEffect(() => {
    const previousBackground = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#101010";
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
    const timer = setTimeout(() => dispatchComposer({ type: "CLEAR_RETURNING_HOME" }), 500);
    return () => clearTimeout(timer);
  }, [isReturningHome]);

  useEffect(() => {
    if (!showAIChips) return;
    dismissComposerKeyboard();
  }, [showAIChips, dismissComposerKeyboard]);

  return {
    isComposer,
    showAIChips,
    isReturningHome,
    keyboardOffset,
    lockedHeight,
    currentPrompt,
    promptChars,
    scatterTargets,
    pullY,
    pullOpacity,
    cursorOpacity,
    introActive,
    newCharStartIndex,
    showCursor,
    showPullHint,
    inputValue,
    hasUserTyped,
    musePrompts,
    musePromptBatch,
    aiChipEnterDelay,
    composerScrollRef,
    textareaRef,
    handleTapToCompose,
    handleBack,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleInputChange,
    handleComposerInputInteract,
    handleChipTap,
    handleQuestionChipTap,
    handleOpenAiMode,
    handleCloseAiMode,
    handleRefreshAiPrompts,
  };
}
