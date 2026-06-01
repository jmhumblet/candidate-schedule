# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server on http://localhost:3000 (interactive watch mode)
npm run test:ci    # Run all Jest unit tests once (use this, not `npm test`)
npx playwright test          # Run Playwright E2E tests against dev server
npx playwright test e2e/integration.spec.ts  # Run a single E2E spec
npm run build      # Production build (required before Playwright in CI)
```

To run a single Jest test file:
```bash
CI=true react-scripts test --testPathPattern="InterviewForm" --watchAll=false
```

## Architecture

This is a **React + TypeScript** SPA with a **Domain-Driven Design** core, deployed to GitHub Pages. Firebase (Auth + Firestore) is the optional backend for cloud sync; the app works fully offline via `localStorage`.

### Layer overview

```
src/domain/         Core business logic — read this first
src/repositories/   Storage abstraction (local vs. Firebase)
src/hooks/          React glue between repositories and UI
src/contexts/       AuthContext (Firebase Google login)
src/components/     UI components
src/firebase/       Firebase init and config
e2e/                Playwright integration tests
```

### Domain layer (`src/domain/`)

Pure TypeScript classes with no React dependencies.

- `Time` / `Duration` — value objects for time arithmetic (`time.ts`, `duration.ts`)
- `JuryDayParameters` / `InterviewParameters` / `Candidate` — input model (`parameters.ts`)
- `SchedulingService.generateSchedule()` — stateless algorithm that turns parameters into a `StructuredSchedule` (`schedulingService.ts`)
- `StructuredSchedule` → `generalSlots` (welcome, lunch, final debrief) + `candidateSchedules[]` each with `interviewSlots[]` (`scheduleTypes.ts`, `interviewSlot.ts`)
- `SessionService.mapToModel()` / `mapFromModel()` — converts rich domain objects ↔ plain JSON-serializable `JuryDayParametersModel` (`session.ts`)
- `EmailTemplateService` — generates `mailto:` links from templates (`EmailTemplates.ts`)

### Storage / repository pattern

`SessionRepository` interface (`repositories/types.ts`) has two implementations chosen at runtime by `useSessions`:
- `LocalSessionRepository` — `localStorage`, always available
- `FirebaseSessionRepository` — Firestore, used when authenticated; queries sessions owned by or shared with the current user

`usePreferences` follows the same dual-repository pattern for theme + email templates.

On login, `useSessions` automatically migrates all local sessions to Firestore in parallel.

### State management

All state lives in `App.tsx` — no Redux or external state library. The `stateRef` pattern (a `useRef` kept in sync via `useEffect`) is used inside `useCallback` closures to read the latest state values without causing those callbacks to be recreated on every render.

### UI

- **Bootstrap 5** via `react-bootstrap` for all layout and form components.
- All user-facing text is in **French**.
- Dark/Light theme toggles via CSS variables; preference persisted through `usePreferences`.
- The layout is a CSS Grid: collapsible `SessionSidebar` on the left, main content on the right. On mobile (< 768 px) the sidebar becomes a slide-in drawer.

## Coding standards

- **French** for all user-visible strings, labels, and date formatting (`fr-FR` locale).
- Functional components + hooks only; no class components.
- Keep business logic in `src/domain/`; components should not contain scheduling math.
- Prefer `getByRole` / `getByLabel` / `getByText` in Playwright tests — avoid CSS or positional selectors.

## Testing approach

Unit tests are co-located with source files (e.g., `InterviewForm.test.tsx` next to `InterviewForm.tsx`). The `e2e/` directory holds Playwright tests for full user flows.

Playwright runs against the **dev server** locally and against the **production build** (`npm run build && npx serve -s build -p 3000`) in CI.

## Verification workflow

When modifying the UI, create temporary Playwright scripts in `verification/` to capture screenshots. **Never commit files from `verification/`** — delete the directory before submitting.

## Firebase configuration

`src/firebase/config.ts` holds the project's API keys (already committed — this is the public Firebase web config, not a secret). To use a different Firebase project, update that file and copy `firestore.rules` to the new project's Firestore Rules.
