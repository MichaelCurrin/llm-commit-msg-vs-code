# Installation
> Guide for end users to build and install the extension locally.

## Prerequisites

- **VS Code** `^1.104.0`.
- **Node.js** and **npm**.
- Optional: **Ollama** (or any OpenAI‑compatible server) if you plan to use the extension.

## Steps

Clone the repo.

Install dependencies:

```bash
npm ci
```

Package the extension (creates a `.vsix` in the current directory):

```bash
npm run ext
```

## Run for development (no install)

- Open the repo in VS Code and press `F5` to launch an Extension Development Host.
- Use the command palette or Source Control view to trigger the extension command.
