import { motion, useTransform, type MotionValue } from "framer-motion";
import { introBaseDelay, introDuration, introStagger, pullMaxDistance } from "../constants/animation";
import type { ScatterTarget } from "../types";

type ScrabbleCharProps = {
  char: string;
  index: number;
  target: ScatterTarget;
  pullY: MotionValue<number>;
  introActive: boolean;
  fadeInExtra: boolean;
};

export function ScrabbleChar({ char, index, target, pullY, introActive, fadeInExtra }: ScrabbleCharProps) {
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
