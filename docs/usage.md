# Usage

Generate a commit message from your staged changes.

## Steps

1. Stage the changes you want included in the message.
1. Open the Source Control view in VS Code.
1. Click the `Generate Commit Message (LLM)` action in the SCM title bar, or run the command from the Command Palette.
1. The extension fills the commit message input. If it cannot, it copies the message to the clipboard and shows a notification.

## Tips

- The message is generated from the unified diff of your repository. If no diff is detected, stage changes and try again.
- Adjust the `Model` and `Endpoint` in Settings if you prefer a different local model or host.
