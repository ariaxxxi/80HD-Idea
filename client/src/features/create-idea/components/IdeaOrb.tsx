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

const ROLE_GRADIENT: Record<IdeaAttributes["role"], string> = {
  spark: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,215,160,0.55) 35%, rgba(255,180,120,0.15) 70%)",
  plan: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.82), rgba(170,210,255,0.55) 35%, rgba(120,170,255,0.15) 70%)",
  grow: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.82), rgba(170,255,215,0.52) 35%, rgba(90,220,150,0.16) 70%)",
};

const PROXIMITY_PULSE_DURATION: Record<IdeaAttributes["proximity"], number> = {
  daily: 1.1,
  weekly: 1.8,
  someday: 2.6,
};

export function IdeaOrb({ attributes, isLaunching }: IdeaOrbProps) {
  return (
    <motion.div
      className="relative flex items-center justify-center w-[176px] h-[176px]"
      animate={
        isLaunching
          ? { y: -280, scale: 1.2, opacity: 0 }
          : { y: 0, scale: 1, opacity: 1 }
      }
      transition={
        isLaunching
          ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          : { type: "spring", stiffness: 120, damping: 20 }
      }
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: ROLE_GRADIENT[attributes.role] }}
        animate={{
          scale: [ENERGY_SCALE[attributes.energy], ENERGY_SCALE[attributes.energy] * 1.06, ENERGY_SCALE[attributes.energy]],
          opacity: [0.5, 0.75, 0.5],
        }}
        transition={{
          duration: PROXIMITY_PULSE_DURATION[attributes.proximity],
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="relative w-[120px] h-[120px] rounded-full border border-white/35 backdrop-blur-sm"
        style={{ background: ROLE_GRADIENT[attributes.role] }}
        animate={{
          scale: [ENERGY_SCALE[attributes.energy], ENERGY_SCALE[attributes.energy] * 1.03, ENERGY_SCALE[attributes.energy]],
          boxShadow: [
            "0 0 20px rgba(255,255,255,0.18)",
            "0 0 34px rgba(255,255,255,0.28)",
            "0 0 20px rgba(255,255,255,0.18)",
          ],
        }}
        transition={{
          duration: PROXIMITY_PULSE_DURATION[attributes.proximity],
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
