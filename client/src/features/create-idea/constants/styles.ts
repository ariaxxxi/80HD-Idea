export const STYLE_TOKENS = {
  promptHeadingClass: "text-[32px] font-normal text-white leading-[38.4px] tracking-[0] flex items-start",
  promptHeadingStyle: {
    fontFamily: "'Roboto Serif', serif",
    fontKerning: "none",
    fontVariantLigatures: "none",
    letterSpacing: "0px",
    willChange: "transform",
  } as const,
  rightNowClass: "text-white font-medium leading-[120%] tracking-[-0.16px] mb-0 pb-[10px]",
  rightNowStyle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "16px",
  } as const,
  starterChipButtonClass:
    "inline-flex h-11 px-5 items-center justify-center rounded-3xl bg-white/10 hover:bg-white/20 transition-colors",
  starterChipTextClass: "text-white/50 font-medium text-base leading-[150%] tracking-[-0.176px]",
  questionChipButtonClass:
    "inline-flex h-12 px-5 items-center justify-center gap-2 rounded-3xl bg-[#101010] border border-white/15 backdrop-blur-[28px] backdrop-saturate-125 hover:bg-white/15 transition-colors",
  questionChipGlowStyle: {
    boxShadow: "0 0 24px rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.22)",
  } as const,
  questionChipTapStyle: {
    scale: 0.98,
    backgroundColor: "rgba(255,255,255,0.2)",
    boxShadow: "0 0 40px rgba(255,255,255,0.35), 0 10px 28px rgba(0,0,0,0.24)",
  } as const,
};
