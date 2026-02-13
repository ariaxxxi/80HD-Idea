import { useEffect, useState } from "react";

export function useKeyboardOffset(active: boolean) {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!active) {
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
  }, [active]);

  return keyboardOffset;
}
