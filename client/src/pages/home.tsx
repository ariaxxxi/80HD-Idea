import { AnimatePresence, motion } from "framer-motion";
import bg1Image from "@assets/bg1.png";
import bg2Image from "@assets/bg2.png";
import moonImage from "@assets/moon.png";
import { HomePromptPanel } from "@/features/create-idea/components/HomePromptPanel";
import { ComposerPanel } from "@/features/create-idea/components/ComposerPanel";
import { ComposerToolbar } from "@/features/create-idea/components/ComposerToolbar";
import { PostCaptureRitual } from "@/features/create-idea/components/PostCaptureRitual";
import { useCreateIdeaFlow } from "@/features/create-idea/hooks/useCreateIdeaFlow";

export default function Home() {
  const {
    isComposer,
    isPostCaptureOpen,
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
    postCaptureView,
    wizardStep,
    attributes,
    isOrbLaunching,
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
    handleFinishTap,
    handleForkCaptureNow,
    handleForkLetGlow,
    handleForkBack,
    handleWizardSelect,
    handleWizardBack,
    handleWizardNext,
  } = useCreateIdeaFlow();

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-[#C3D0D5]"
      style={{
        touchAction: isComposer ? "auto" : "none",
        height: lockedHeight ? `${lockedHeight}px` : "100vh",
        overscrollBehavior: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute inset-0 pointer-events-none">
        <motion.img
          src={bg1Image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ opacity: isComposer ? 0 : 1 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          aria-hidden="true"
          data-testid="bg-image-home"
        />
        <motion.img
          src={bg2Image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ opacity: isComposer ? 1 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          aria-hidden="true"
          data-testid="bg-image-composer"
        />
      </div>

      <div className="relative z-20 h-full">
        <AnimatePresence>
          {isComposer && showAIChips && (
            <div className="absolute inset-x-0 bottom-0 z-[60] flex justify-center pointer-events-none">
              <motion.div
                key="ai-mode-moon-blur"
                className="absolute rounded-full bg-white/20 blur-[80px]"
                initial={{ width: 90, height: 90, y: 300 }}
                animate={{ width: 700, height: 700, y: 270 }}
                exit={{
                  width: 90,
                  height: 90,
                  y: 300,
                  transition: { duration: 1.2, ease: [0.6, 0, 0.4, 1] },
                }}
                transition={{
                  duration: 2,
                  ease: [0.64, 0, 0.5, 1],
                }}
                aria-hidden="true"
                data-testid="ai-mode-moon-blur"
              />
              <motion.img
                key="ai-mode-moon"
                src={moonImage}
                alt=""
                className="pointer-events-none max-w-none"
                initial={{ width: 90, height: 90, y: 300 }}
                animate={{ width: 700, height: 700, y: 270 }}
                exit={{
                  width: 90,
                  height: 90,
                  y: 300,
                  transition: { duration: 1.2, ease: [0.6, 0, 0.4, 1] },
                }}
                transition={{
                  duration: 2,
                  ease: [0.64, 0, 0.5, 1],
                }}
                aria-hidden="true"
                data-testid="ai-mode-moon"
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isComposer && !isPostCaptureOpen && (
            <motion.button
              className="absolute top-4 left-4 z-30 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBack}
              data-testid="button-back"
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6L9 12L15 18" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isComposer && (
            <HomePromptPanel
              isReturningHome={isReturningHome}
              showPullHint={showPullHint}
              pullOpacity={pullOpacity}
              currentPrompt={currentPrompt}
              promptChars={promptChars}
              scatterTargets={scatterTargets}
              pullY={pullY}
              introActive={introActive}
              newCharStartIndex={newCharStartIndex}
              showCursor={showCursor}
              cursorOpacity={cursorOpacity}
              onTapToCompose={handleTapToCompose}
            />
          )}

          {isComposer && (
            <ComposerPanel
              composerScrollRef={composerScrollRef}
              textareaRef={textareaRef}
              inputValue={inputValue}
              keyboardOffset={keyboardOffset}
              hasUserTyped={hasUserTyped}
              showAIChips={showAIChips}
              isLocked={isPostCaptureOpen}
              musePromptBatch={musePromptBatch}
              aiChipEnterDelay={aiChipEnterDelay}
              musePrompts={musePrompts}
              onInputChange={handleInputChange}
              onComposerInputInteract={handleComposerInputInteract}
              onStarterChipTap={handleChipTap}
              onQuestionChipTap={handleQuestionChipTap}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isComposer && !isPostCaptureOpen && (
            <ComposerToolbar
              showAIChips={showAIChips}
              keyboardOffset={keyboardOffset}
              onOpenAiMode={handleOpenAiMode}
              onCloseAiMode={handleCloseAiMode}
              onRefreshAiPrompts={handleRefreshAiPrompts}
              onFinish={handleFinishTap}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isComposer && postCaptureView && (
            <motion.div
              key="post-capture-ritual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <PostCaptureRitual
                view={postCaptureView}
                wizardStep={wizardStep}
                attributes={attributes}
                isOrbLaunching={isOrbLaunching}
                sourceText={inputValue}
                onForkBack={handleForkBack}
                onForkCaptureNow={handleForkCaptureNow}
                onForkLetGlow={handleForkLetGlow}
                onWizardBack={handleWizardBack}
                onWizardNext={handleWizardNext}
                onWizardSelect={handleWizardSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
