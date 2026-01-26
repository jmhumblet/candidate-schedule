## 2026-01-14 - [Expensive useEffect in TimelineVisualization]
**Learning:** TimelineVisualization performs expensive calculations in useEffect whenever the 'slots' prop changes. Since App was passing a new array reference on every render, this caused TimelineVisualization to re-calculate and re-render twice on every keystroke in the parent form.
**Action:** Always memoize derived arrays/objects passed as props to expensive child components, especially those with useEffect dependencies on those props.

## 2026-02-03 - [Redundant Data Grouping in TimelineVisualization]
**Learning:** `TimelineVisualization` was iterating over a flat list of slots to group them by candidate (O(N)) on every render. This was redundant because the parent `App` component already possessed the structured `schedule` object containing this grouping.
**Action:** Pass structured data objects directly to child components instead of flattening them, avoiding unnecessary reconstruction logic in children.
