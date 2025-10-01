# Usage

Generate a commit message from your staged changes.

## Steps

- Stage the changes you want included in the message.
- Open the Source Control view in VS Code.
- Click the `Generate Commit Message (LLM)` action in the SCM title bar, or run the command from the Command Palette.
- The extension fills the commit message input. If it cannot, it copies the message to the clipboard and shows a notification.

## Tips

- The message is generated from the unified diff of your repository. If no diff is detected, stage changes and try again.
- Adjust the `Model` and `Endpoint` in Settings if you prefer a different local model or host.
