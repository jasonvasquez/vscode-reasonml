import { remote } from "ocaml-language-server";
import * as vscode from "vscode";
import * as client from "vscode-languageclient";

async function execute(
  languageClient: client.LanguageClient,
  event: vscode.TextDocumentWillSaveEvent,
): Promise<vscode.TextEdit[]> {
  const textDocument = {
    content: event.document.getText(),
    languageId: event.document.languageId,
    uri: event.document.uri.toString(),
    version: event.document.version,
  };
  const response = await languageClient.sendRequest(remote.server.giveFormatted, textDocument, undefined);
  if (response == null) return [];
  const formatted = `${response}\n`;
  const fullRange = new vscode.Range(
    event.document.positionAt(0),
    event.document.positionAt(textDocument.content.length),
  );
  return [vscode.TextEdit.replace(fullRange, formatted)];
}

export function register(context: vscode.ExtensionContext, languageClient: client.LanguageClient): void {
  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument(event => {
      if (event.document.languageId === "reason") {
        if (vscode.workspace.getConfiguration("reason").get<boolean>("formatOnSave", false)) {
          event.waitUntil(execute(languageClient, event));
        }
      }
    }),
  );
}
