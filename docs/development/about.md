# About

## Overview

This extension adds a command and SCM title-bar action to generate a Git commit message using a local LLM (OpenAI-compatible API such as Ollama). It gathers a unified Git diff, prompts the model to produce a conventional commit-style message, and places the result in the Source Control input box.

## Libraries and APIs

- **VS Code**: Uses `vscode` to register the command, show progress and notifications, access the Git extension (`vscode.git`), and write to the SCM input box or clipboard.
- **Node.js stdlib**: Uses `child_process.exec` (promisified) to run `git` as a fallback for diffs.
- **HTTP**: Uses global `fetch` in the VS Code runtime to call an OpenAI-compatible chat completions endpoint.

## Getting the Git diff

- **Primary path (Git API)**: Retrieves the first repository from `vscode.git` and tries `repo.diffWithHEAD()`; if unavailable, tries `repo.diffIndexWithHEAD()`.
- **Fallback (CLI)**: If the API path fails or doesn’t yield a string, runs `git diff --staged` in the repository root using `exec`.
- **Validation**: If the resulting diff is empty, the command errors and prompts you to stage changes.

## Calling the LLM

- **Endpoint and model**: Configured via Settings → `llmCommitMsg.endpoint` (default `http://localhost:11434/v1`) and `llmCommitMsg.model` (default `gemma3`).
- **Prompts**: Sends a system prompt to guide style and a user prompt embedding the unified diff in a fenced `diff` block; truncates very large diffs to keep requests reasonable.
- **Request**: POSTs to `<endpoint>/chat/completions` with `stream: false`, then reads `choices[0].message.content` from the response.
- **Cleanup**: Strips outer triple-backtick fences if present to return plain text.

## Applying the result in VS Code

- If available, writes the generated message to `repo.inputBox.value` so it appears in the SCM view.
- If not, copies to the clipboard and shows a notification.
- The command runs under a progress notification and surfaces success/error messages.

## Configuration

- **llmCommitMsg.endpoint**: Base URL of the OpenAI-compatible API (e.g., Ollama). Default: `http://localhost:11434/v1`.
- **llmCommitMsg.model**: Model name used for generation. Default: `gemma3`.
