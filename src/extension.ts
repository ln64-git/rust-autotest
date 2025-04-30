import * as vscode from 'vscode';
import { exec } from 'child_process';

let isRunning = false;
let enabled = true;

export function activate(context: vscode.ExtensionContext) {
	// Auto run tests on Rust file save
	const onSave = vscode.workspace.onDidSaveTextDocument(async (doc) => {
		if (!enabled || doc.languageId !== 'rust' || isRunning) return;

		const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!cwd) return;

		isRunning = true;

		exec('cargo test --no-run', { cwd }, async (err, stderr) => {
			if (err) {
				console.error(stderr);
				isRunning = false;
				return;
			}

			try {
				await vscode.commands.executeCommand('testing.refreshTests');
				await new Promise(res => setTimeout(res, 300));
				await vscode.commands.executeCommand('testing.runAll');
			} catch (e) {
				console.error(e);
				vscode.window.showErrorMessage('⚠️ Failed to run tests');
			}

			isRunning = false;
		});
	});

	context.subscriptions.push(onSave);
}

