import { TypeRef } from "./TypeDef"
import * as mustache from "mustache"

export class ConvertFunctionRepository {
  convertMap = new Map([
    ["number:string", "String({{param}})"],
    ["number:boolean", "Boolean({{param}}"],
    ["number:bigint", "BigInt({{param}}"],
    ["string:number", "Number({{param}}"],
    ["string:boolean", "Boolean({{param}}"],
    ["string:bigint", "BigInt({{param}}"],
    ["boolean:string", "String({{param}}"],
    ["boolean:number", "{{param}} ? 1 : 0"],
    ["boolean:bigint", "{{param}} ? 1 : 0"],
    ["bigint:string", "String({{param}}"],
    ["bigint:number", "Number({{param}}"],
    ["bigint:boolean", "Boolean({{param}}"]
  ])

  getConvertFunction(fromRef: TypeRef, toRef: TypeRef): string {
    const v = this.getFunction(fromRef.stripType(), toRef.stripType())
    return this.wrapSpecialTypes(fromRef, v)
  }

  wrapSpecialTypes(fromRef: TypeRef, convertFunc: string): string {
    if (fromRef.isArray) {
      const f = mustache.render(convertFunc, { param: "e" })
      return `{{param}}.map(e => ${f})`
    } else if (fromRef.isPromise) {
      const f = mustache.render(convertFunc, { param: "r" })
      return `{{param}}.then(r => ${f})`
    } else {
      return convertFunc
    }
  }

  getFunction(fromType: string, toType: string): string {
    if (fromType === toType) {
      return "{{param}}"
    }
    const v = this.convertMap.get(`${fromType}:${toType}`)
    if (v) {
      return v
    }
    return `${fromType}To${toType}({{param}})`
  }
}
