---
description: A low-friction, high-context workflow for interactive exploration and coding.
---

# Interactive Mode (Gemini Antigravity)

This workflow is optimized for LLMs with large context windows (like Gemini) to work effortlessly ("antigravity") within the codebase.

## 1. Context Loading (The "Upload")
Before doing any work, ground yourself in the reality of the project.
- **Read Instructions:** Read `AGENTS.md` and `src/ToDos.md`.
- **Map Territory:** Run `ls -R src/` to see the file structure.
- **Ingest Domain:** Read all files in `src/domain/`. This is the "physics" of the app.
- **Ingest UI:** Read `src/App.tsx` and key components.

## 2. Interactive Loop
Repeat this loop for each sub-task:

### A. Exploration & Planning
- Identify the goal (e.g., "Fix the overlap bug" or "Add a clear button").
- **Read:** Use `read_file` to examine relevant code.
- **Plan:** Formulate a short plan using `set_plan`.
- **Knowledge:** Use `knowledgebase_lookup` if you encounter unknown libraries.

### B. Execution
- **Code:** Apply changes using `write_file` or `replace_with_git_merge_diff`.
- **Verify (Code):** Run `npm run test:ci` immediately. Fix compilation errors.
- **Verify (Visual):** (If Browser MCP is available)
    - Start app in background: `npm start > app.log 2>&1 &`
    - Wait for it to be ready.
    - Visit `http://localhost:3000`.
    - Take a screenshot or check for console errors.

### C. Reflection
- Did it work?
- If yes -> Commit (using `git commit` or `submit` tool).
- If no -> Read errors, re-read files, adjust plan.

## 3. Completion
- Summarize what was done.
- Update `src/ToDos.md` if new tasks were discovered or completed.
