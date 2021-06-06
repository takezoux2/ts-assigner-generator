import * as ts from "typescript"

export class TypeDefLoader {
  transformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context) => (file) => {
      ts.forEachChild(file, (node) => {
        ts.forEachChild(node, (n2) => {
          console.log(n2.kind)
        })
        // if(ts.isInterfaceDeclaration(node)) {
        //   console.log(node.getText().substring(0,100))
        // }
        // const v = ts.SyntaxKind.SemicolonClassElement
        console.log("1", node.kind)
      })

      return file
    }
  }

  run() {
    ts.transpileModule(
      `
    import {Hoge} from "../Hoge"
    export interface User { id: string }`,
      {
        transformers: {
          before: [this.transformer()]
        }
      }
    )
  }
}
