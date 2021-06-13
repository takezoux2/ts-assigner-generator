import * as ts from "typescript"
import { Field, TypeDef, TypeRef } from "./TypeDef"

export class TypeDefLoader {
  typeDefs: TypeDef[] = []
  transformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context) => (file) => {
      ts.forEachChild(file, (node) => {
        if (ts.isInterfaceDeclaration(node)) {
          const typeDef = new TypeDef(node.name.getText())
          this.parseInterfce(node, typeDef)
          this.typeDefs.push(typeDef)
        }
      })
      return file
    }
  }
  parseInterfce(node: ts.InterfaceDeclaration, typeDef: TypeDef) {
    console.log("Members:", node.members.length)
    node.members.forEach((member) => {
      if (ts.isPropertySignature(member) && member.type) {
        const type = this.parseType(member.type)
        const field = new Field(
          member.name.getText(),
          member.questionToken ? TypeRef.Option(type) : type
        )
        typeDef.addField(field)
      }
    })
  }
  parseType(node: ts.TypeNode): TypeRef {
    if (ts.isArrayTypeNode(node)) {
      return TypeRef.Array(this.parseType(node.elementType))
    } else if (ts.isTypeReferenceNode(node)) {
      if (node.typeName.getText() === "Promise") {
        return TypeRef.Promise(this.parseType(node.typeArguments![0]))
      } else {
        return TypeRef.create(
          node.typeName.getText(),
          node.typeArguments?.map((t) => this.parseType(t)) ?? []
        )
      }
    } else {
      return TypeRef.create(node.getText())
    }
  }

  run(code: string) {
    ts.transpileModule(code, {
      transformers: {
        before: [this.transformer()]
      }
    })
    return this.typeDefs
  }
}
