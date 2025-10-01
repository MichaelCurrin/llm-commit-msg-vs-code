const vscode = require('vscode');
const { exec } = require('node:child_process');
const { promisify } = require('node:util');
const asyncExec = promisify(exec);

/**
 * Return VS Code Git API v1 if available.
 *
 * @returns {import('vscode').Extension<any>["exports"] | undefined} Git API exports or undefined.
 */
function getGitApi() {
	const gitExtension = vscode.extensions.getExtension('vscode.git');
	if (!gitExtension) {
		return undefined;
	}
	const exports = gitExtension.exports;
	if (!exports || typeof exports.getAPI !== 'function') {
		return undefined;
	}
	return exports.getAPI(1);
}

/**
 * Execute a git diff command in the given working directory.
 *
 * @param {string} cwd Working directory path.
 * @param {boolean} staged Whether to diff staged changes only.
 *
 * @returns {Promise<string>} Diff output text.
 */
async function gitDiffFallback(cwd, staged) {
	const args = staged ? 'diff --staged' : 'diff';
	const { stdout } = await asyncExec(`git ${args}`, { cwd, maxBuffer: 10 * 1024 * 1024 });
	return stdout;
}

/**
 * Get a unified diff string from the first available repository using the Git extension API.
 * Falls back to invoking the git binary if necessary.
 *
 * @param {any} api VS Code Git API v1.
 *
 * @returns {Promise<{ repo: any, diff: string }>} Repository and its diff string.
 */
async function getRepositoryDiff(api) {
	if (!api || !Array.isArray(api.repositories) || api.repositories.length === 0) {
		throw new Error('No Git repository found.');
	}
	const repo = api.repositories[0];

	// Prefer the API methods when available.
	if (typeof repo.diffWithHEAD === 'function') {
		const diff = await repo.diffWithHEAD();
		if (typeof diff === 'string') {
			return { repo, diff };
		}
	}
	if (typeof repo.diffIndexWithHEAD === 'function') {
		const diff = await repo.diffIndexWithHEAD();
		if (typeof diff === 'string') {
			return { repo, diff };
		}
	}

	// Fallback to shelling out to git in the workspace.
	const cwd = repo.rootUri?.fsPath;
	const diff = await gitDiffFallback(cwd || process.cwd(), true);
	return { repo, diff };
}

/**
 * Call an OpenAI-compatible chat completions endpoint (Ollama) to generate a commit message.
 *
 * @param {string} endpoint Base URL to the API, e.g. http://localhost:11434/v1.
 * @param {string} model Model name.
 * @param {string} diff Unified diff text.
 *
 * @returns {Promise<string>} Generated commit message.
 */
async function generateCommitMessageWithLLM(endpoint, model, diff) {
	const trimmed = diff.length > 60_000 ? `${diff.slice(0, 60_000)}\n... [truncated]` : diff;
	const system = 'You are a helpful assistant that writes high-quality Git commit messages.';
	const user = [
		'Given the following unified git diff, write a clear, conventional commit message.',
		'- Provide a concise title (<= 72 chars).',
		'- Include a brief body with bullet points when helpful.',
		'- Use imperative mood and explain the "why" when evident from the diff.',
		'',
		'```diff',
		trimmed,
		'```',
	].join('\n');

	const res = await fetch(`${endpoint}/chat/completions`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			model,
			messages: [
				{ role: 'system', content: system },
				{ role: 'user', content: user },
			],
			stream: false,
		}),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => String(res.status));
		throw new Error(`LLM request failed: ${res.status} ${text}`);
	}
	const data = await res.json();
	const hasChoices = data && typeof data === 'object' && 'choices' in data;
	const choices = hasChoices ? /** @type {any} */ (data).choices : undefined;
	const firstChoice = Array.isArray(choices) ? choices[0] : undefined;
	const content = firstChoice && firstChoice.message && typeof firstChoice.message.content === 'string'
		? firstChoice.message.content
		: undefined;
	if (!content) {
		throw new Error('LLM returned no content.');
	}
	return stripOuterCodeFence(content.trim());
}

/**
 * Strip a surrounding triple backtick code fence (optionally with language) from text.
 *
 * @param {string} text Raw text possibly wrapped in ``` fences.
 * @returns {string} Unfenced text.
 */
function stripOuterCodeFence(text) {
	let result = text.trim();
	if (!result.startsWith('```') && !result.endsWith('```')) {
		return result;
	}
	// Remove leading fence line: ``` or ```lang
	if (result.startsWith('```')) {
		const firstNewlineIdx = result.indexOf('\n');
		if (firstNewlineIdx !== -1) {
			result = result.slice(firstNewlineIdx + 1);
		} else {
			result = result.replace(/^```+/, '');
		}
	}
	// Remove trailing fence: on its own line or at end
	if (result.endsWith('```')) {
		// If there's a trailing newline then the last three backticks should be on the final line
		const lastFenceIdx = result.lastIndexOf('```');
		if (lastFenceIdx !== -1) {
			result = result.slice(0, lastFenceIdx);
		}
	}
	return result.trim();
}

/**
 * Generate and set the commit message for the active repository.
 *
 * @returns {Promise<void>} Nothing.
 */
async function generateAndApplyCommitMessage() {
	const api = getGitApi();
	if (!api) {
		throw new Error('VS Code Git extension not available.');
	}
	let { repo, diff } = await getRepositoryDiff(api);
	if (typeof diff !== 'string') {
		// Ensure a string diff by falling back to shell git.
		const cwd = repo?.rootUri?.fsPath || process.cwd();
		diff = await gitDiffFallback(cwd, true);
	}
	if (!diff || (typeof diff === 'string' && diff.trim().length === 0)) {
		throw new Error('No changes to generate a commit message from. Stage changes first.');
	}
	const config = vscode.workspace.getConfiguration('llmCommitMsg');
	const endpoint = config.get('endpoint', 'http://localhost:11434/v1');
	const model = config.get('model', 'llama3.1');
	const message = await generateCommitMessageWithLLM(endpoint, model, diff);
	if (repo?.inputBox) {
		repo.inputBox.value = message;
	} else {
		await vscode.env.clipboard.writeText(message);
		vscode.window.showInformationMessage('Commit message copied to clipboard (no repository input box found).');
	}
}

/**
 * Activate the extension.
 *
 * @param {vscode.ExtensionContext} context VS Code extension context.
 *
 * @returns {void} Nothing.
 */
function activate(context) {
	console.log('Extension "llm-commit-msg" active');

	const disposable = vscode.commands.registerCommand('llm-commit-msg.generateCommitMessage', async () => {
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Generating commit message with LLM...',
			cancellable: false,
		}, async () => {
			try {
				await generateAndApplyCommitMessage();
				vscode.window.showInformationMessage('Generated commit message.');
			} catch (error) {
				const msg = error instanceof Error ? error.message : String(error);
				vscode.window.showErrorMessage(msg);
			}
		});
	});

	context.subscriptions.push(disposable);
}

/**
 * Deactivate the extension.
 *
 * @returns {void} Nothing.
 */
function deactivate() { }

module.exports = {
	activate,
	deactivate,
	// Export internals for testing
	getGitApi,
	getRepositoryDiff,
	generateCommitMessageWithLLM,
	generateAndApplyCommitMessage,
}
