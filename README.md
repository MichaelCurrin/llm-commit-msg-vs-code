# LLM Commit Message (VS Code)
> Generate a commit message in VS Code Git sidebar using a local LLM

[![Made with JavaScript](https://img.shields.io/badge/Made_with-JavaScript-blue?logo=javascript&logoColor=white)](https://www.javascript.com/ "Go to JavaScript homepage")
[![License](https://img.shields.io/badge/License-MIT-blue)](#license "Go to License section")

This extensions adds a button to the Git extension sidebar - clicking it sends a Git diff to a local LLM (default Ollama) and uses a generated commit message in the box.

## Note

- This extension is not available in the extensions library. You can build and install it locally though.
- This was developed with Cursor quickly, the code and quality has not been verified.
- This extension has only been tested in VS Code and not in Cursor.
- The extension button is a long name - this needs to be shortened or made into an icon.

## Benefits

- Free (does not require ChatGPT account and subscription)
- Secure (does not send your code over the internet like the builtin button or ChatGPT-related extensions)
- Choose from a server and model

## Documentation

[Docs website](https://michaelcurrin.github.io/llm-commit-msg-vs-code/)

## Quickstart

1. Get [Ollama](https://michaelcurrin.github.io/dev-cheatsheets/cheatsheets/artificial-intelligence/ollama/) installed.
1. Open VS Code.
1. Open a Git repository.
1. Stage your changes.
1. Click `Generate Commit Message (LLM)` in the Source Control title bar (or run the command via the Command Palette).
1. Edit if needed, then commit.

<div align="center">
    <img src="https://raw.githubusercontent.com/MichaelCurrin/llm-commit-msg-vs-code/main/sample.png"
        alt="sample screenshot"
        width="300" />
</div>

## Related projects

- [MichaelCurrin/llm-commit-msg-py](https://github.com/MichaelCurrin/llm-commit-msg-py)
    > CLI tool to generate a commit message with an LLM then commit it

## License

Released under [MIT](/LICENSE) by [@MichaelCurrin](https://github.com/MichaelCurrin).
