# AI Tooling Recommendations

To maximize AI agency and enable "Antigravity" workflows in this repository, the following servers and tools are recommended.

## 1. Language Server Protocol (LSP)
These servers provide code intelligence (auto-complete, go-to-definition, errors).

- **TypeScript/JavaScript (`typescript-language-server` or `tsserver`):** Essential for understanding the codebase, checking types, and safe refactoring.
- **ESLint:** Crucial for maintaining code quality and adhering to React best practices.

## 2. Model Context Protocol (MCP)
MCP allows the AI to interact with the environment.

- **Filesystem MCP (`@modelcontextprotocol/server-filesystem`):** **Required.** Allows the agent to read and write files, exploring the codebase.
- **Browser Automation (Playwright/Puppeteer):** **Highly Recommended.** Allows the agent to:
    - Start the app (`npm start`).
    - Navigate to `http://localhost:3000`.
    - Verify UI changes visually (screenshots) or functionally (clicking buttons).
    - This is critical for the "Visual QA" workflow.
- **GitHub MCP:** Useful for reading issues, creating pull requests, and checking CI status.

## 3. Interactive Workflows
With these tools, you can enable:

- **Auto-Refactor:** The agent reads `src/domain`, spots code smells, and proactively refactors them.
- **Visual Regression Testing:** The agent makes a CSS change, takes a screenshot, and compares it (or asks for user verification).
- **Test-Driven Development (TDD):** The agent writes a failing test in `src/__tests__`, runs `npm run test:ci`, then implements the code.
