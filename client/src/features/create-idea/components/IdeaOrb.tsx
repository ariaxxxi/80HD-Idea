import { motion } from "framer-motion";
import type { IdeaAttributes } from "../types";

type IdeaOrbProps = {
  attributes: IdeaAttributes;
  isLaunching: boolean;
};

const ENERGY_SCALE: Record<IdeaAttributes["energy"], number> = {
  dim: 0.88,
  soft: 1,
  bright: 1.14,
};

const ROLE_TONE: Record<IdeaAttributes["role"], string> = {
  spark: "rgba(255, 122, 58, 0.96)",
  plan: "rgba(248, 94, 57, 0.98)",
  grow: "rgba(255, 170, 112, 0.94)",
};

const ROLE_SHADOW: Record<IdeaAttributes["role"], [string, string, string]> = {
  spark: [
    "0 0 28px rgba(255,122,58,0.24)",
    "0 0 58px rgba(255,122,58,0.38)",
    "0 0 28px rgba(255,122,58,0.24)",
  ],
  plan: [
    "0 0 28px rgba(248,94,57,0.22)",
    "0 0 56px rgba(248,94,57,0.34)",
    "0 0 28px rgba(248,94,57,0.22)",
  ],
  grow: [
    "0 0 28px rgba(255,170,112,0.22)",
    "0 0 56px rgba(255,170,112,0.34)",
    "0 0 28px rgba(255,170,112,0.22)",
  ],
};

const PROXIMITY_BLUR: Record<IdeaAttributes["proximity"], number> = {
  daily: 5,
  weekly: 12,
  someday: 24,
};

const PULSE_DURATION = 1.8;

export function IdeaOrb({ attributes, isLaunching }: IdeaOrbProps) {
  return (
    <motion.div
      className="relative flex h-[176px] w-[176px] items-center justify-center"
      animate={isLaunching ? { y: -280, scale: 1.2, opacity: 0 } : { y: 0, scale: 1, opacity: 1 }}
      transition={
        isLaunching
          ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          : { type: "spring", stiffness: 120, damping: 20 }
      }
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-[14px]"
        animate={{ scale: ENERGY_SCALE[attributes.energy] }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            backgroundColor: ROLE_TONE[attributes.role],
            filter: `blur(${PROXIMITY_BLUR[attributes.proximity] * 2}px)`,
            scale: [1, 1.08, 1],
            opacity: [0.36, 0.58, 0.36],
          }}
          transition={{
            backgroundColor: { duration: 0.35, ease: "easeInOut" },
            filter: { duration: 0.35, ease: "easeInOut" },
            scale: { duration: PULSE_DURATION, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: PULSE_DURATION, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </motion.div>

      <motion.div
        className="relative h-[122px] w-[122px]"
        animate={{ scale: ENERGY_SCALE[attributes.energy] }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            backgroundColor: ROLE_TONE[attributes.role],
            filter: `blur(${PROXIMITY_BLUR[attributes.proximity]}px)`,
            scale: [1, 1.04, 1],
            boxShadow: ROLE_SHADOW[attributes.role],
          }}
          transition={{
            backgroundColor: { duration: 0.35, ease: "easeInOut" },
            boxShadow: { duration: 0.35, ease: "easeInOut" },
            filter: { duration: 0.35, ease: "easeInOut" },
            scale: { duration: PULSE_DURATION, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </motion.div>
    </motion.div>
  );
}
