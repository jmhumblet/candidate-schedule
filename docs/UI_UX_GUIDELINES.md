# UI/UX Guidelines

This document serves as the source of truth for the application's UI/UX standards, theming engine, and component usage. Adherence to these guidelines ensures a consistent, sleek, and modern interface.

## 1. Theming Engine & Color Palette

The application uses a semantic CSS variable system to handle Light and Dark modes. **Do not use hex values directly in component CSS.** Instead, use the semantic variables defined in `:root`.

Theme toggling is handled via the `data-bs-theme` attribute on the `<html>` element (`light` or `dark`), persisted in `localStorage`.

### Semantic Color Reference

| Variable | Light Mode | Dark Mode | Description |
| :--- | :--- | :--- | :--- |
| **Backgrounds** | | | |
| `--bg-body` | `#f8f9fa` | `#212529` | Main page background |
| `--bg-surface` | `#ffffff` | `#2b3035` | Card, sidebar, modal backgrounds |
| `--bg-surface-secondary` | `#e9ecef` | `#343a40` | Hover states, secondary sections |
| **Text** | | | |
| `--text-primary` | `#212529` | `#f8f9fa` | Primary content text |
| `--text-secondary` | `#6c757d` | `#adb5bd` | Metadata, subtitles, helper text |
| `--text-inverse` | `#ffffff` | `#ffffff` | Text on high-contrast backgrounds (buttons, timeline) |
| **Borders** | | | |
| `--border-color` | `#dee2e6` | `#495057` | Standard borders |
| `--border-color-subtle` | `#e9ecef` | `#343a40` | Subtle dividers |
| **Accent / Brand** | | | |
| `--accent-primary` | `#fd7e14` | `#d96d12` | Primary action color (Orange) |
| `--accent-primary-hover` | `#e36802` | `#bf5f0f` | Hover state for primary actions |
| **Status** | | | |
| `--status-info-bg` | `#e7f1ff` | `#0c2e5e` | Info background |
| `--status-info-text` | `#0c63e4` | `#6ea8fe` | Info text |
| `--status-warning-bg` | `#fff3e0` | `#4d2c00` | Warning background |
| `--status-warning-text` | `#ef6c00` | `#feb272` | Warning text |
| `--status-neutral-bg` | `#f8f9fa` | `#343a40` | Neutral background |
| `--status-neutral-text` | `#6c757d` | `#adb5bd` | Neutral text |

## 2. Layout & Spacing

### 8-Point Grid System
We adhere to an 8-point grid for spacing to ensure visual rhythm. Use the defined CSS variables:

| Variable | Value | Pixels | Usage |
| :--- | :--- | :--- | :--- |
| `--space-0_5` | `0.25rem` | 4px | Minimal adjustments |
| `--space-1` | `0.5rem` | 8px | Small gaps, icon spacing |
| `--space-2` | `1rem` | 16px | Standard padding, card gaps |
| `--space-3` | `1.5rem` | 24px | Section separation |
| `--space-4` | `2rem` | 32px | Large section breaks |
| `--space-6` | `3rem` | 48px | Major layout divisions |

**Sleekness Factor:** Generous whitespace is mandatory. Avoid cluttered interfaces.

**Do:**
*   Use Flexbox for component alignment.
*   Use CSS Grid for macro layouts.

## 3. Typography

We use a fluid type scale utilizing `rem` and `clamp()` to ensure readability across all devices.

| Variable | Usage |
| :--- | :--- |
| `--font-xs` | Captions, small metadata |
| `--font-sm` | Sidebar items, secondary text |
| `--font-base` | Body text, form inputs |
| `--font-lg` | Section headers, modal titles |
| `--font-xl` | Page titles, major headings |

## 4. Component Rules

### Buttons
*   **Primary Actions:** Use `.btn-orange` (mapped to `--accent-primary`).
*   **Secondary Actions:** Use Outline variants.
*   **States:** ensure distinct styles for `:hover`, `:active`, `:focus`, and `:disabled`.
*   **Focus:** Must have a visible focus ring using `--shadow-focus`.

### Inputs
*   **Background:** Use `--bg-body` (input) on `--bg-surface` (card/container).
*   **Focus:** Must have a clear focus ring (accessibility requirement). Use `--shadow-focus`.
*   **Labels:** Always associate labels with inputs using `htmlFor`.

### Cards & Surfaces
*   **Light Mode:** Use subtle shadows (`--shadow-card`) for depth.
*   **Dark Mode:** Avoid black shadows. Use lighter background overlays (via `--bg-surface`) and/or borders (`--border-color`) to define depth.
*   **Implementation:** The global `.card` class is overridden in `src/index.css` to handle this automatically.

## 5. Accessibility Checklist

*   [ ] **Semantic HTML:** Use `<main>`, `<nav>`, `<article>`, `<header>`, `<footer>` appropriately to define document structure.
*   [ ] **Contrast:** Ensure text meets WCAG AA standards (4.5:1 ratio).
*   [ ] **Keyboard Navigation:** All interactive elements must be focusable and usable via keyboard.
*   [ ] **ARIA Labels:** Use `aria-label` or `aria-labelledby` when visual context is insufficient (e.g., icon-only buttons).
*   [ ] **Focus Management:** Ensure focus order is logical and visible. Input fields must have clear focus rings.

## 6. Directory Structure

*   `src/index.css`: Global styles, CSS Variables (Theming), Reset, and Component Overrides.
*   `src/Sidebar.css`: Styles specific to the SessionSidebar, utilizing semantic variables.
*   `src/TimelineVisualization.css`: Styles for the timeline component, utilizing semantic variables.
*   `src/components/`: Reusable UI components (e.g., `InterviewForm.tsx`, `ScheduleTable.tsx`).
*   `src/domain/`: Business logic and types (agnostic of UI).
*   `src/App.tsx`: Main application layout.
*   `public/`: Static assets.

---
*Architected by Jules AI - Senior Frontend Engineer*
