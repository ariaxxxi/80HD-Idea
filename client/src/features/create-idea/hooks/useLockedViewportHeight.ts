import { useEffect, useState } from "react";

export function useLockedViewportHeight(active: boolean) {
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!active) {
      setLockedHeight(null);
      return;
    }
    setLockedHeight(window.innerHeight);
  }, [active]);

  return lockedHeight;
}
