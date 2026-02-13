# Composer Regression Checklist

## Scope
Use this checklist after changes to `create-idea` flow to prevent motion, keyboard, and layout regressions.

## Commands
1. `npm run check`
2. `npm run dev`

## Home Screen
1. Prompt line renders and cursor breathes after intro completes.
2. Pull-down scrabble effect scatters letters and returns cleanly.
3. Pull-refresh swaps prompt text without layout jump.
4. Tap prompt transitions to composer.

## Composer Screen
1. Textarea is editable and cursor stays visible while typing.
2. Composer body scrolls internally; page itself does not scroll.
3. Last lines remain visible above toolbar/keyboard.
4. Top fade mask fades scrolled text smoothly.
5. Back button returns to home with stable text positions.

## AI Mode
1. Sparkle opens AI mode and dismisses keyboard.
2. `AI-BG` fades in and out over 1.2s.
3. Question chips appear with delayed staggered float-in.
4. Refresh triggers exit of current chips, then new chips enter.
5. Exit animation order for chips is correct and consistent.
6. Selecting a chip inserts text, closes AI mode, and refocuses textarea.
7. Tapping textarea while AI mode is open closes AI mode.

## iOS Device Checks
1. Safari iOS: keyboard offset keeps toolbar above keyboard.
2. Chrome iOS: same behavior as Safari.
3. No white flashes or viewport jumps on composer open/close.
