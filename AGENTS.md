# Agent Instructions for Interview Scheduler

## Project Overview
This is a React application written in TypeScript for scheduling interviews. It uses Bootstrap for styling and implements a Domain-Driven Design (DDD) approach for its core logic.

## Key Directories
- **`src/domain/`**: Contains the core business logic (e.g., `schedule.ts`, `interviewSlot.ts`). **Read this first** to understand the data models and rules.
- **`src/components/`**: Contains the UI components (e.g., `InterviewForm.tsx`, `ScheduleTable.tsx`).
- **`src/assets/`**: Contains static assets like images and icons.
- **`e2e/`**: Contains Playwright integration tests.

> **Note on Tests:** Unit tests are co-located with their source files (e.g., `InterviewForm.test.tsx` is next to `InterviewForm.tsx`).

## How to Run
- **Start App:** `npm start` (Runs on port 3000. Interactive watch mode.)
- **Run Unit Tests:** `npm run test:ci` (Runs all Jest tests once.)
- **Run Integration Tests:** `npx playwright test` (Runs Playwright tests.)
- **Build:** `npm run build` (Builds for production.)

## "Gemini Antigravity" Guidelines
To operate with maximum efficiency and leverage your large context window ("Antigravity" mode):

1.  **Ingest Context First:** Before modifying code, use `read_file` to ingest all files in `src/domain/`. This grounds you in the "physics" of the application (types, rules, constraints).
2.  **Think in Systems:** When adding a feature, trace the data flow from `src/domain` to the UI components. Don't just patch the UI; ensure the domain model supports the change.
3.  **Use `test:ci`:** Always use `npm run test:ci` to verify your changes. Avoid `npm test` as it waits for input.
4.  **Visual Verification:** If you are modifying the UI, check `App.tsx` and related components. If a browser automation tool is available, use it to verify the rendered output.

## Integration Testing Strategy (Future Proofing)
**All UI changes and new features MUST be covered by integration tests (Playwright).**

1.  **Mandatory Coverage:**
    -   **Happy Paths:** Ensure the main user flows (e.g., generating a schedule) work end-to-end.
    -   **Persistence:** Verify that user preferences (e.g., Theme) and critical state survive page reloads.
    -   **Interactivity:** Test key interactions like button clicks, form submissions, and toggles.

2.  **Writing Future-Proof Tests:**
    -   **Use Accessible Selectors:** Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors.
        -   *Good:* `page.getByRole('button', { name: 'Générer' })`
        -   *Bad:* `page.locator('.btn-orange')` or `div > div > button`
    -   **Avoid Brittle Implementation Details:** Do not rely on specific DOM structures (like `nth-child`) that might change with styling updates.
    -   **User-Centric:** Test what the user sees and does, not the implementation details.

3.  **Testing Environment:**
    -   **Local:** Playwright runs against `npm start` (dev server).
    -   **CI/GitHub Actions:** Playwright runs against `npm run build` (production build) served via `serve`.

## Coding Standards
- **Framework:** React (Functional Components + Hooks).
- **Language:** TypeScript. Strictly type all interfaces and props.
- **Localization:** French. All user-facing text, labels, and date formats must be in French.
- **Styling:** Bootstrap 5 (via `react-bootstrap`).
- **Testing:** Jest + React Testing Library (Unit) / Playwright (Integration).
- **Separation of Concerns:** Keep business logic in `src/domain` and UI logic in components.

## Tasks
Refer to `src/ToDos.md` for a list of pending tasks and improvements.
