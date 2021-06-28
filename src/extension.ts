// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { SSL_OP_ALL } from "constants"
import * as vscode from "vscode"
import { Mapper } from "./mapper/Mapper"
import { TypeDefLoader } from "./mapper/TypeDefLoader"
import * as path from "path"

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
function pickSymbol(placeHolder: string): Promise<vscode.QuickPickItem> {
  return new Promise((resolve, reject) => {
    const picker = vscode.window.createQuickPick()
    picker.placeholder = placeHolder

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
            detail: toValidPath(s.location.uri.path)
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

function toValidPath(filePath: string) {
  if (path.sep === "\\" && filePath.startsWith("/")) {
    // Windowsの場合、"/C:/a/b/c.ts"の形式でパスが取得されてしまうが、
    // そのままだと不正なパスになるため先頭の/を取り除く
    return filePath.substring(1)
  } else {
    return filePath
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Congratulations, your extension 'ts-assigner' is now active!")

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "ts-assigner.generateAssignCode",
    async () => {
      const fromSymbol = await pickSymbol(
        "Select 'convert from' class/interface"
      )
      const toSymbol = await pickSymbol("Select 'convert to' class/interface")

      const loadTypeDef = (s: vscode.QuickPickItem) => {
        const loader = new TypeDefLoader()
        loader.load(s.detail ?? "")
        return loader.typeDefs.find((t) => t.name === s.label)
      }

      const fromTypeDef = loadTypeDef(fromSymbol)
      const toTypeDef = loadTypeDef(toSymbol)
      if (!fromTypeDef) {
        throw new Error(`Class:${fromSymbol.label} not found`)
      }
      if (!toTypeDef) {
        throw new Error(`Class:${toSymbol.label} not found`)
      }
      const code = new Mapper().generate(fromTypeDef, toTypeDef)
      console.log(code)

      const f = await vscode.workspace.openTextDocument({
        language: "TypeScript",
        content: code
      })
    }
  )

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log("Deactivate")
}
