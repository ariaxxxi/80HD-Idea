import { AnimatePresence, motion, type MotionValue } from "framer-motion";

type BreathingCursorProps = {
  visible: boolean;
  opacity?: MotionValue<number>;
};

export function BreathingCursor({ visible, opacity }: BreathingCursorProps) {
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
