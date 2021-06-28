import { TypeRef } from "./TypeDef"
import * as mustache from "mustache"

export class ConvertFunctionRepository {
  convertMap = new Map([
    ["number:string", "String({{param}})"],
    ["number:boolean", "Boolean({{param}})"],
    ["number:bigint", "BigInt({{param}})"],
    ["string:number", "Number({{param}})"],
    ["string:boolean", "Boolean({{param}})"],
    ["string:bigint", "BigInt({{param}})"],
    ["boolean:string", "String({{param}})"],
    ["boolean:number", "{{param}} ? 1 : 0"],
    ["boolean:bigint", "{{param}} ? 1 : 0"],
    ["bigint:string", "String({{param}})"],
    ["bigint:number", "Number({{param}})"],
    ["bigint:boolean", "Boolean({{param}})"]
  ])

  getConvertFunction(fromRef: TypeRef, toRef: TypeRef): string {
    const v = this.getFunction(fromRef.stripType(), toRef.stripType())
    return this.wrapSpecialTypes(fromRef, v)
  }

  /**
   * 配列などの特殊処理を行う型の解決を行う
   * @param fromRef
   * @param convertFunc
   * @returns
   */
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

  /**
   * オブジェクトの変換するコードを取得
   * @param fromType
   * @param toType
   * @returns
   */
  getFunction(fromType: string, toType: string): string {
    // 同じ型の場合は変換不要
    if (fromType === toType) {
      return "{{param}}"
    }
    // 変換関数が登録されている場合に取得
    const v = this.convertMap.get(`${fromType}:${toType}`)
    if (v) {
      return v
    }
    // それ以外は生成される変換関数を返す
    return `${fromType}To${toType}({{param}})`
  }
}
