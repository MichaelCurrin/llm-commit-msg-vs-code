# Installation

# Prerequisites

- **VS Code**
- **Git** installed and a Git repository opened in VS Code.
- **Ollama** (or another OpenAI‑compatible server) running and reachable at `http://localhost:11434/v1`.

## Ollama setup (example)

- Install Ollama and ensure the OpenAI‑compatible endpoint is running.
- Pull or run a model that matches your settings, e.g. `gemma3`:
  - `ollama pull gemma3`
  - `ollama run gemma3`

## Configure the extension

- Open VS Code Settings and search for `LLM Commit Message`.
- Set:
  - `llmCommitMsg.endpoint` (default `http://localhost:11434/v1`).
  - `llmCommitMsg.model` (default `gemma3`).

Install from source (development)

- Clone this repository.
- Open it in VS Code and press `F5` to launch an Extension Development Host.
- In the Extension Development Host, open a Git repository and use the command from the Source Control view (see Usage).
