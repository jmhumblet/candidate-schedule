---
description: A structured workflow for developing new features.
---

# Feature Development Workflow

## 1. Requirements
- **Understand:** Read the requirements.
- **Check Domain:** specific `src/domain` to see if the new feature requires model changes.

## 2. Design
- **Plan:** Outline the changes.
- **Interfaces:** Define new interfaces or types in `src/domain` or component props.

## 3. Implementation (TDD Recommended)
- **Test:** Write a test for the new feature (it will fail or not compile).
- **Code:** Implement the feature.
- **Verify:** Run `npm run test:ci`.

## 4. UI Implementation (If applicable)
- **Component:** Create or update React components.
- **Style:** Apply Bootstrap classes.
- **Verify:** Use `npm start` (if interactive) or rely on component tests.

## 5. Finalize
- **Check Integration:** Ensure the new feature plays well with existing code.
- **Commit:** Submit the changes.
