# Installation
> Guide for end users to build and install the extension locally.

## Prerequisites

- **VS Code**
- **Node.js** and **npm**.
- **Ollama** (or any OpenAI‑compatible server)

## Steps

Clone the repo.

```sh
git clone https://github.com/MichaelCurrin/llm-commit-msg-vs-code
cd llm-commit-msg-vs-code
```

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
