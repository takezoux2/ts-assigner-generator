// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { SSL_OP_ALL } from "constants"
import * as vscode from "vscode"
import { Mapper } from "./mapper/Mapper"
import { TypeDefLoader } from "./mapper/TypeDefLoader"

function isAccessibleTsClassOrInterfaceSourceCode(s: vscode.SymbolInformation) {
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
function pickSymbol(): Promise<vscode.QuickPickItem> {
  return new Promise((resolve, reject) => {
    const picker = vscode.window.createQuickPick()
    picker.onDidChangeValue(async (v) => {
      const symbols: vscode.SymbolInformation[] = (
        (await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
          "vscode.executeWorkspaceSymbolProvider",
          v
        )) ?? []
      ).filter(isAccessibleTsClassOrInterfaceSourceCode)
      if (symbols.length > 0) {
        picker.items = symbols.map((s) => {
          return {
            label: s.name,
            detail: s.location.uri.path
          }
        })
      }
    })
    let resolved = false
    picker.onDidAccept(() => {
      const items = picker.items
      resolved = true
      picker.hide()
      resolve(items[0])
    })
    picker.onDidHide(() => {
      if (!resolved) {
        reject(new Error("Canceled"))
        resolved = true
      }
    })
    picker.show()
  })
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
    "ts-asigner.generateAssignCode",
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
      const fromSymbol = await pickSymbol()
      const toSymbol = await pickSymbol()

      const loader = new TypeDefLoader()
      for (const filePath of new Set([fromSymbol.detail, toSymbol.detail])) {
        loader.load(filePath ?? "")
      }

      const fromTypeDef = loader.typeDefs.find(
        (t) => t.name === fromSymbol.label
      )
      console.log(loader.typeDefs.map((t) => t.name))
      const toTypeDef = loader.typeDefs.find((t) => t.name === toSymbol.label)
      console.log(fromTypeDef, toTypeDef)
      if (!fromTypeDef) {
        throw new Error(`Class:${fromSymbol.label} not found`)
      }
      if (!toTypeDef) {
        throw new Error(`Class:${toSymbol.label} not found`)
      }
      const code = new Mapper().generate(fromTypeDef, toTypeDef)
      console.log(code)

      vscode.workspace.openTextDocument({
        language: "TypeScript",
        content: code
      })
      //console.log(firstSymbol, secondSymbol);
    }
  )

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log("Deactivate")
}
