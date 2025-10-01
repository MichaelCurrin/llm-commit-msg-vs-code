---
permalink: /
---
# LLM Commit Message – Documentation

This VS Code extension generates high‑quality Git commit messages using a local LLM exposed via an OpenAI‑compatible API (e.g. Ollama).

- [Installation](installation.md)
- [Usage](usage.md)
- [Development](development/)

## Quickstart

1. Ensure Ollama.
1. In VS Code, open a Git repository and stage your changes.
1. Click `Generate Commit Message (LLM)` in the Source Control title bar (or run the command via the Command Palette).
1. Edit if needed, then commit.


## Notes

- Requires the VS Code Git extension and an active Git repository.
- The extension writes the generated message into the Source Control input box. If not available, it copies the message to the clipboard.
