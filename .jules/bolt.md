## 2026-01-14 - [Expensive useEffect in TimelineVisualization]
**Learning:** TimelineVisualization performs expensive calculations in useEffect whenever the 'slots' prop changes. Since App was passing a new array reference on every render, this caused TimelineVisualization to re-calculate and re-render twice on every keystroke in the parent form.
**Action:** Always memoize derived arrays/objects passed as props to expensive child components, especially those with useEffect dependencies on those props.
