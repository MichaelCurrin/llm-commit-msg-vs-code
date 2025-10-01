const assert = require("assert");
const vscode = require("vscode");
const { generateCommitMessageWithLLM } = require("..");

suite("LLM Commit Msg", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("generateCommitMessageWithLLM returns content", async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => ({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "feat: test message" } }],
        }),
      });
      const msg = await generateCommitMessageWithLLM(
        "http://localhost:11434/v1",
        "dummy",
        "diff --git a b",
      );
      assert.strictEqual(msg, "feat: test message");
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("generateCommitMessageWithLLM strips outer backticks", async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => ({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "```\nfeat: fenced message\n```" } }],
        }),
      });
      const msg = await generateCommitMessageWithLLM(
        "http://localhost:11434/v1",
        "dummy",
        "diff --git a b",
      );
      assert.strictEqual(msg, "feat: fenced message");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
