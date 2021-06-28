import * as ts from "typescript"
import { Field, TypeDef, TypeRef } from "./TypeDef"
import * as fs from "fs"

export class TypeDefLoader {
  typeDefs: TypeDef[] = []
  transformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context) => (file) => {
      ts.forEachChild(file, (node) => {
        if (ts.isInterfaceDeclaration(node)) {
          const typeDef = new TypeDef(node.name.getText())
          this.parseClassOrInterface(node, typeDef)
          this.typeDefs.push(typeDef)
        } else if (ts.isClassDeclaration(node)) {
          const className = node.name?.getText() ?? "UnkownClass"
          const typeDef = new TypeDef(className)
          this.parseClassOrInterface(node, typeDef)
          this.typeDefs.push(typeDef)
        }
      })
      return file
    }
  }
  parseClassOrInterface(
    node: ts.ClassDeclaration | ts.InterfaceDeclaration,
    typeDef: TypeDef
  ) {
    const isPublic = (modifiers: ts.ModifiersArray | undefined) => {
      return !(
        modifiers &&
        modifiers.find((modi) => {
          return modi.getText() === "private" || modi.getText() === "protected"
        })
      )
    }
    node.members.forEach((member: ts.ClassElement | ts.TypeElement) => {
      if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
        // 引数なしのgetterの場合のみ対象にする
        if (member.parameters.length == 0) {
          const type = this.parseType(member.type)
          const field = new Field(
            member.name.getText(),
            member.questionToken ? TypeRef.Option(type) : type,
            true
          )
          typeDef.addField(field)
        }
      } else if (
        ts.isPropertyDeclaration(member) ||
        ts.isGetAccessorDeclaration(member) ||
        ts.isPropertySignature(member)
      ) {
        const typeKind = this.getTypeKind(member.type)

        switch (typeKind) {
          case "SimpleType": {
            const type = this.parseType(member.type)
            if (isPublic(member.modifiers)) {
              const field = new Field(
                member.name.getText(),
                member.questionToken ? TypeRef.Option(type) : type,
                false
              )
              typeDef.addField(field)
            }
            break
          }
          case "Getter": {
            const fType = member.type as ts.FunctionTypeNode
            const type = this.parseType(fType.type)
            if (isPublic(member.modifiers)) {
              const field = new Field(
                member.name.getText(),
                member.questionToken ? TypeRef.Option(type) : type,
                true
              )
              typeDef.addField(field)
            }
            break
          }
          default:
          // 引数ありの関数なので変換対処から除外
        }
      } else {
        console.log("Unkonwn field", member.getText().substring(0, 100))
      }
    })
  }
  parseType(node: ts.TypeNode | undefined): TypeRef {
    if (!node) {
      return TypeRef.Any
    }
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
  getTypeKind(
    node: ts.TypeNode | undefined
  ): "SimpleType" | "Getter" | "Function" {
    if (!node) return "SimpleType" // any扱い
    if (ts.isFunctionTypeNode(node)) {
      if (node.parameters.length === 0) {
        return "Getter"
      } else {
        return "Function"
      }
    } else {
      return "SimpleType"
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
  load(filePath: string) {
    console.log("Load", filePath)
    console.log(fs.readFileSync(filePath.substring(1), "utf8"))
    return this.run(fs.readFileSync(filePath.substring(1), "utf8"))
  }
}
