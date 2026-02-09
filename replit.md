# Overview

This is a creative idea-capture and writing application with a highly animated, mobile-first UI. The app features a "Home State" for idea capture with animated prompts (e.g., "I'm thinking about") that transitions seamlessly into a "Composer State" for writing. The experience is designed to feel fluid and polished, with character-by-character text animations, slot-machine prompt cycling, inspiration chips, and a keyboard-aware input toolbar.

The project uses a full-stack TypeScript architecture with a React frontend (Vite) and an Express backend, connected to a PostgreSQL database via Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend (client/)
- **Framework:** React 18 with TypeScript, bundled by Vite
- **Routing:** Wouter (lightweight client-side router)
- **State/Data Fetching:** TanStack React Query for server state management
- **UI Components:** shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Animation:** Framer Motion for complex animations (character-by-character text reveal, spring physics, slot-machine transitions, AnimatePresence for enter/exit)
- **Styling:** Tailwind CSS with CSS variables for theming (light/dark mode support), custom color system using HSL variables
- **Path Aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Key Page:** `client/src/pages/home.tsx` - The main interaction page with animated prompt display, pull-to-refresh prompt cycling, focus transition to composer mode, starter chips, and a fixed input toolbar

## Backend (server/)
- **Framework:** Express 5 on Node.js with TypeScript (run via tsx)
- **Architecture:** Single HTTP server serving both API routes and static files
- **API Pattern:** All API routes should be prefixed with `/api`
- **Storage Layer:** Abstract `IStorage` interface with a `MemStorage` in-memory implementation as default. This is designed to be swapped to a database-backed implementation.
- **Dev Server:** Vite dev server middleware is integrated for HMR during development

## Shared (shared/)
- **Schema:** Drizzle ORM schema definitions in `shared/schema.ts`, shared between frontend and backend
- **Validation:** Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Current Tables:** `users` table with `id` (UUID), `username`, and `password` fields

## Database
- **ORM:** Drizzle ORM configured for PostgreSQL
- **Connection:** Uses `DATABASE_URL` environment variable
- **Migrations:** Output to `./migrations` directory
- **Schema Push:** `npm run db:push` uses drizzle-kit to push schema changes

## Build Process
- **Dev:** `tsx server/index.ts` runs the server with Vite middleware for HMR
- **Production Build:** Custom build script (`script/build.ts`) that:
  1. Builds client with Vite (output to `dist/public/`)
  2. Builds server with esbuild (output to `dist/index.cjs`), bundling select dependencies to reduce cold start times
- **Production Run:** `node dist/index.cjs` serves the built static files

## Key Design Decisions
- **Monorepo Structure:** Client, server, and shared code in one repo with TypeScript path aliases for clean imports
- **In-Memory Storage Default:** The storage interface allows easy migration from in-memory to PostgreSQL without changing route code
- **Mobile-First Animations:** The app uses `interactive-widget=resizes-content` viewport meta tag for proper keyboard behavior on mobile, and Framer Motion spring physics for tactile animations
- **Component Library:** Full shadcn/ui component set is pre-installed, providing a consistent design system

# External Dependencies

- **PostgreSQL:** Required database, connected via `DATABASE_URL` environment variable
- **Drizzle ORM + drizzle-kit:** Database ORM and migration tooling
- **Google Fonts:** DM Sans, Architects Daughter, Fira Code, Geist Mono loaded via CDN in index.html
- **Framer Motion:** Animation library used extensively in the home page for character animations, spring physics, and presence transitions
- **Radix UI:** Headless UI primitives powering all shadcn/ui components
- **TanStack React Query:** Server state management with configured defaults (no auto-refetch, infinite stale time)
- **Replit Plugins:** `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev-only Replit integrations)