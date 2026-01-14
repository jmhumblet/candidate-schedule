# Agent Instructions for Interview Scheduler

## Project Overview
This is a React application written in TypeScript for scheduling interviews. It uses Bootstrap for styling and implements a Domain-Driven Design (DDD) approach for its core logic.

## Key Directories
- **`src/domain/`**: Contains the core business logic (e.g., `schedule.ts`, `interviewSlot.ts`). **Read this first** to understand the data models and rules.
- **`src/`**: Contains the UI components (e.g., `App.tsx`, `ScheduleTable.tsx`).
- **`src/__tests__/`**: Contains unit and integration tests.

## How to Run
- **Start App:** `npm start` (Runs on port 3000. Interactive watch mode.)
- **Run Tests:** `npm run test:ci` (Runs all tests once. Use this for verifying changes.)
- **Build:** `npm run build` (Builds for production.)

## "Gemini Antigravity" Guidelines
To operate with maximum efficiency and leverage your large context window ("Antigravity" mode):

1.  **Ingest Context First:** Before modifying code, use `read_file` to ingest all files in `src/domain/`. This grounds you in the "physics" of the application (types, rules, constraints).
2.  **Think in Systems:** When adding a feature, trace the data flow from `src/domain` to the UI components. Don't just patch the UI; ensure the domain model supports the change.
3.  **Use `test:ci`:** Always use `npm run test:ci` to verify your changes. Avoid `npm test` as it waits for input.
4.  **Visual Verification:** If you are modifying the UI, check `App.tsx` and related components. If a browser automation tool is available, use it to verify the rendered output.

## Coding Standards
- **Framework:** React (Functional Components + Hooks).
- **Language:** TypeScript. Strictly type all interfaces and props.
- **Styling:** Bootstrap 5 (via `react-bootstrap`).
- **Testing:** Jest + React Testing Library.
- **Separation of Concerns:** Keep business logic in `src/domain` and UI logic in components.

## Tasks
Refer to `src/ToDos.md` for a list of pending tasks and improvements.
