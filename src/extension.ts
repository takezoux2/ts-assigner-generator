// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { SSL_OP_ALL } from "constants"
import * as vscode from "vscode"

function isSourceCodeAccessibleTsClassOrInterface(s: vscode.DocumentSymbol) {
  if (
    s.kind === vscode.SymbolKind.Class ||
    s.kind === vscode.SymbolKind.Interface
  ) {
    const location: vscode.Location = (s as any).location

    if (location && location.uri.scheme === "file") {
      return vscode.workspace.workspaceFolders?.some((f) => {
        return location.uri.path.startsWith(f.uri.path)
      })
    }
  }
  return false
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Congratulations, your extension 'ts-asigner' is now active!")

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "ts-asigner.helloWorld",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      // vscode.window.showInformationMessage('Hello World from ts-asigner!');
      // const quickPick = vscode.window.showQuickPick(["a","b"]);
      // vscode.window.showInputBox({
      // 	title: "hoge",
      // 	placeHolder: "aaa"
      // });
      console.log("Try to get symbols")
      const picker = vscode.window.createQuickPick()
      picker.onDidChangeValue(async (v) => {
        const symbols: vscode.DocumentSymbol[] = (
          (await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
            "vscode.executeWorkspaceSymbolProvider",
            v
          )) ?? []
        ).filter(isSourceCodeAccessibleTsClassOrInterface)
        if (symbols.length > 0) {
          picker.items = symbols.map((s) => {
            return {
              label: s.name,
              detail: s.detail
            }
          })
        }
      })
      picker.onDidAccept(() => {
        vscode.workspace.openTextDocument({
          language: "TypeScript",
          content: "select " + picker.activeItems.map((i) => i.label).join(",")
        })
        picker.hide()
      })
      picker.show()
      // const firstSymbol = await vscode.window.showQuickPick(symbols.map(s => {
      // 	return s.name;
      // }));

      // const secondSymbol = await vscode.window.showQuickPick(symbols.map(s => {
      // 	return s.name;
      // }));

      //console.log(firstSymbol, secondSymbol);
    }
  )

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log("Deactivate")
}
