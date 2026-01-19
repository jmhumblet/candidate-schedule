# UI/UX Guidelines

This document serves as the source of truth for the application's UI/UX standards, theming engine, and component usage. Adherence to these guidelines ensures a consistent, sleek, and modern interface.

## 1. Theming Engine & Color Palette

The application uses a semantic CSS variable system to handle Light and Dark modes. **Do not use hex values directly in component CSS.** Instead, use the semantic variables defined in `:root`.

Theme toggling is handled via the `data-bs-theme` attribute on the `<html>` element (`light` or `dark`), managed by `src/components/ThemeToggle.tsx` and persisted via `localStorage` (or Firestore if logged in).

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
| `--text-inverse` | `#ffffff` | `#ffffff` | Text on high-contrast backgrounds (buttons) |
| **Borders** | | | |
| `--border-color` | `#dee2e6` | `#495057` | Standard borders |
| `--border-color-subtle` | `#e9ecef` | `#343a40` | Subtle dividers |
| **Accent / Brand** | | | |
| `--accent-primary` | `#fd7e14` | `#d96d12` | Primary action color (Orange) |
| `--accent-primary-hover` | `#e36802` | `#bf5f0f` | Hover state for primary actions |
| **Shadows** | | | |
| `--shadow-card` | `0 1px 3px rgba(...)` | `none` | Card depth (relies on bg color in dark mode) |

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

**Guidelines:**
*   Use Flexbox for component alignment.
*   Use CSS Grid for macro layouts.
*   Ensure generous whitespace to maintain a "sleek" aesthetic. Avoid clutter.

## 3. Typography

We use a fluid type scale utilizing `clamp()` to ensure readability across all devices.

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
*   **States:** Ensure distinct styles for `:hover`, `:active`, `:focus`, and `:disabled`.
*   **Icons:** Always pair icons with text or provide `aria-label` for icon-only buttons.

### Inputs
*   **Background:** Use `--bg-body` or `--bg-surface`.
*   **Focus:** Must have a clear focus ring (using box-shadow) for accessibility.
*   **Labels:** Always associate labels with inputs using `htmlFor`.

### Cards & Surfaces
*   **Light Mode:** Use subtle shadows (`--shadow-card`) for depth.
*   **Dark Mode:** Avoid black shadows. Use lighter background overlays (`--bg-surface` vs `--bg-body`) to define depth.
*   **Note:** Standard shadow utility classes (`.shadow-sm`, `.shadow`, `.shadow-lg`) are globally overridden in `src/index.css` to use `--shadow-card`, ensuring they vanish in dark mode.

## 5. Accessibility Checklist

*   [ ] **Semantic HTML:** Use `<main>`, `<nav>`, `<article>`, `<header>`, `<footer>` appropriately.
*   [ ] **Contrast:** Ensure text meets WCAG AA standards (4.5:1 ratio).
    *   *Note:* Timeline colors have been adjusted for Dark Mode to ensure compliance.
*   [ ] **Keyboard Navigation:** All interactive elements must be focusable and usable via keyboard.
*   [ ] **ARIA Labels:** Use `aria-label` or `aria-labelledby` when visual context is insufficient (e.g., icon-only buttons).
*   [ ] **Focus Management:** Ensure focus order is logical and visible.

## 6. Directory Structure

*   `src/index.css`: Global styles, CSS Variables (Theming), Reset.
*   `src/components/*.css`: Component-specific styles (must use variables).
*   `src/components/`: Reusable UI components.
*   `src/domain/`: Business logic and types (agnostic of UI).
*   `src/App.tsx`: Main application layout.
