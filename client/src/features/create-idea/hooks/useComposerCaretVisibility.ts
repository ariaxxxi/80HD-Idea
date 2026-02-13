import { useEffect, type RefObject } from "react";

type UseComposerCaretVisibilityParams = {
  isComposer: boolean;
  inputValue: string;
  keyboardOffset: number;
  composerScrollRef: RefObject<HTMLDivElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

export function useComposerCaretVisibility({
  isComposer,
  inputValue,
  keyboardOffset,
  composerScrollRef,
  textareaRef,
}: UseComposerCaretVisibilityParams) {
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
  }, [inputValue, isComposer, keyboardOffset, composerScrollRef, textareaRef]);
}
