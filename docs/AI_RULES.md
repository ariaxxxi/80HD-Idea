# AI Rules (80HD - The Idea Garden)

## Product
- **App:** A low-friction, sensory-friendly "Idea Garden" for ADHD minds. It replaces anxiety-inducing to-do lists with playful, tactile interactions (slot machines, floating text) to capture and incubate fleeting thoughts.
- **Primary target:** Mobile web first (PWA behavior).
- **Key flows:**
  1.  **The Spark (Home):** Organic text entry ("I'm thinking about...") with "Slot Machine" pull-to-refresh prompts.
  2.  **The Composer (Focus):** Distraction-free writing mode with AI "Muse" chips that fade on typing.
  3.  **The Planting (Completion):** Visually transforming text into a "seed" that drops into the garden (archive).

## Tech/Architecture
- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (`clsx` / `tailwind-merge` for class management)
- **Animation:** `framer-motion` (CRITICAL: used for all layout transitions and spring physics)
- **Icons:** `lucide-react`
- **State:** Zustand (for global UI states like `isComposerOpen`, `activePrompt`)
- **Routing:** `wouter` or `react-router-dom` (lightweight preference)
- **Components live in:** `src/components` (Atomic design: atoms, molecules, organisms)
- **Pages live in:** `src/pages`
- **Hooks live in:** `src/hooks`

## Interaction & Vibe Logic (The "Pillow" Standard)
**Goal:** All motion must feel **organic, fluid, and calming.** Avoid "chaotic" or "aggressive" values that trigger sensory overwhelm.

- **Spring Physics:** Prefer **"Heavy/Damped"** springs over "High Tension" ones to mimic underwater resistance.
  - *Recommended Default:* `type: "spring", stiffness: 120, damping: 20, mass: 1`
  - *Avoid:* `stiffness: >300` (too snappy) or `bounce: >0.5` (too jittery).
- **Opacity Mapping:** When scattering or moving elements rapidly, reduce their opacity (e.g., `0.5` or `0`) to reduce visual noise.
- **Timing:** Avoid linear easings. Use `easeInOut` or spring-based timing. Transitions should rarely be faster than `0.3s` unless instant feedback is required (like typing).

## Constraints
- **Vibe Check:** The UI must feel "organic" and "fluid," not "SaaS-like." Use soft gradients, deep charcoal backgrounds, and editorial serif fonts (e.g., *Editorial New* or *Playfair Display*).
- **Physics over CSS:** Prefer `framer-motion` springs (`stiffness`, `damping`) over standard CSS transitions for interactions.
- **Do not add new dependencies** unless explicitly asked (e.g., stick to `framer-motion` for animations).
- **Keep changes minimal;** no massive refactors.
- **Strict Typing:** No `any`. Define interfaces for all Props and State.

## Mobile-first UI rules
- **Default Viewport:** Design strictly for mobile (390x844).
- **Touch Targets:** All interactive elements must be >= 44px.
- **Keyboard Awareness:** The bottom toolbar must use `position: fixed` and respect `interactive-widget=resizes-content` to stay above the virtual keyboard.
- **Gestures:** Prioritize swiping and pulling (e.g., Pull-to-Refresh) over clicking small buttons.
- **Safe Areas:** Respect iOS Home Indicator and Notch safe areas (`pb-safe`, `pt-safe`).

## Definition of Done
- `npm run verify` (or `tsc && vite build`) passes.
- No console errors in the modified flow.
- **Motion Check:** Animations feel "heavy" and tactile (no linear easings).
- Works perfectly on mobile viewport (390px wide).
- Keyboard interactions (focus/blur) do not break the layout.