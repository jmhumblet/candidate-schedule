## 2024-05-22 - [Copy Feedback and NPM Conflict]
**Learning:** Separating the copy action from the content header improves accessibility and flexibility, avoiding copying the button itself along with the content.
**Action:** When implementing copy-to-clipboard, verify if the trigger element is part of the copied target.

**Learning:** AGENTS.md instructions for `npm` usage superseded the general Persona `pnpm` mandate for this project.
**Action:** Always check repo-specific docs (AGENTS.md, README.md, lockfiles) before strictly following persona tool constraints.

## 2026-01-25 - [Accessible Icon Buttons]
**Learning:** For icon-only buttons in this codebase using React Bootstrap, combining `OverlayTrigger` (Tooltip) with `aria-label` on the `Button` ensures both visual feedback and screen reader accessibility.
**Action:** Always wrap icon-only buttons in `OverlayTrigger` with a descriptive tooltip and add a matching `aria-label` to the button element.
