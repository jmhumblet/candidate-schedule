# AI Tooling Recommendations

To maximize AI agency and enable "Antigravity" workflows in this repository, the following servers and tools are recommended.

## 1. Language Server Protocol (LSP)
These servers provide code intelligence (auto-complete, go-to-definition, errors).

- **TypeScript/JavaScript (`typescript-language-server`):** Essential for understanding the codebase, checking types, and safe refactoring.
- **ESLint:** Crucial for maintaining code quality and adhering to React best practices.

## 2. Model Context Protocol (MCP)
MCP allows the AI to interact with the environment.

- **Filesystem MCP (`@modelcontextprotocol/server-filesystem`):** **Required.** Allows the agent to read and write files, exploring the codebase.
- **Browser Automation (Playwright/Puppeteer):** **Highly Recommended.** Allows the agent to:
    - Start the app (`npm start`).
    - Navigate to `http://localhost:3000`.
    - Verify UI changes visually (screenshots) or functionally (clicking buttons).
- **GitHub MCP:** Useful for reading issues, creating pull requests, and checking CI status.

## 3. Usage by Google AI Suite (Jules, Antigravity)

**Jules** and **Gemini Antigravity** leverage this `AI_TOOLING.md` file as a capability manifesto.

1.  **Context Bootstrapping:** When an agent initializes in this repository, it reads this file to understand the "physics" of its environment. It learns that it *can* see the browser or ask the LSP for type definitions, rather than assuming it's working in a static text editor.
2.  **Tool Discovery:** If the environment supports dynamic tool loading, the agent uses the "Installation Guide" below to verifying if the required servers are running.
3.  **Workflow Activation:** Knowing that a Browser MCP is available, the agent will dynamically switch to the "Visual QA" workflow (described in `.agent/workflows/interactive-mode.md`) instead of guessing CSS changes.
4.  **Antigravity Optimization:** The LSP integration allows the agent to traverse the dependency graph efficiently without needing to read every single file into its context window manually, optimizing the "Antigravity" large-context usage for high-level reasoning rather than syntax parsing.

## 4. Installation Guide for Users

To enable these capabilities for local development or for connecting local tools to your AI agent:

### A. Install LSP Servers
Install the language servers globally or in your dev dependencies.

```bash
# TypeScript / Javascript
npm install -g typescript-language-server typescript

# ESLint
npm install -g vscode-langservers-extracted
```

### B. Install MCP Servers
These servers implement the Model Context Protocol. You typically run these via an MCP client or config.

```bash
# Filesystem access
npx -y @modelcontextprotocol/server-filesystem /path/to/repo

# GitHub access (requires GH_TOKEN)
npx -y @modelcontextprotocol/server-github

# Browser Automation (Playwright based)
# (Note: specific implementation depends on the MCP provider, but usually requires playwright)
npm install -D playwright
```

### C. Configuration
If using an MCP-compatible IDE or Agent Runtime, add these to your configuration file (e.g., `mcp_config.json`):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```
