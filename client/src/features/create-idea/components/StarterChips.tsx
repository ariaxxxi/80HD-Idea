import { AnimatePresence, motion } from "framer-motion";
import { STYLE_TOKENS } from "../constants/styles";

type StarterChipsProps = {
  visible: boolean;
  chips: string[];
  onChipTap: (chip: string) => void;
};

export function StarterChips({ visible, chips, onChipTap }: StarterChipsProps) {
  return (
    <AnimatePresence>
      {visible && (
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
          {chips.map((chip) => (
            <motion.button
              key={chip}
              className={STYLE_TOKENS.starterChipButtonClass}
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
              onClick={() => onChipTap(chip)}
              data-testid={`chip-starter-${chip.replace(/\s+/g, "-")}`}
            >
              <span className={STYLE_TOKENS.starterChipTextClass} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {chip}
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
