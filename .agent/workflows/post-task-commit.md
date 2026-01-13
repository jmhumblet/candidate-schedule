---
description: commit changes after completing a task
---

After completing a development task and verifying the changes:

1. Stage all relevant changes:
   ```
   git add .
   ```
2. Update the `task.md` and `walkthrough.md` artifacts to reflect the final state.
3. Notify the user of the completed work, provide relevant artifacts for review, and ask if they are ready to commit the changes.
4. Only after receiving user approval, perform the commit with a concise, descriptive message:
   ```
   git commit -m "[Brief description of changes]"
   ```
5. Notify the user once the commit is done.
