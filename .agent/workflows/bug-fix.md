---
description: A structured workflow for fixing bugs.
---

# Bug Fix Workflow

## 1. Reproduce
- **Read:** Understand the reported issue.
- **Locate:** Find the code responsible.
- **Test:** Create a reproduction test case in `src/__tests__` that fails.
- **Verify Failure:** Run `npm run test:ci` to confirm the test fails.

## 2. Analyze
- **Read Context:** Read `src/domain` files if the bug is logic-related.
- **Hypothesize:** Determine the root cause.

## 3. Fix
- **Modify:** Apply the fix to the source code.
- **Verify:** Run `npm run test:ci`.
    - The new test should pass.
    - Existing tests should still pass.

## 4. Finalize
- **Refactor:** Clean up the code if necessary.
- **Commit:** Submit the changes.
