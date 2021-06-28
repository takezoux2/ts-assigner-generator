import { TypeDefLoader } from "./TypeDefLoader"

describe("TypeDefLoader", () => {
  test("Load interface", () => {
    const loader = new TypeDefLoader()

    const types = loader.run(
      `
    import {Hoge} from "../Hoge"
    export interface User { 
      id: string
      names: string[]
      promise: Promise<number>
      myType: MyType
      generics: MyGene<number,string>
      array: Array<number>
      opType?: boolean
    }`
    )
    const type = types.find((t) => t.name === "User")
    if (!type) {
      fail("Fail to parse User interface")
    }
    const expects = [
      ["id", "string"],
      ["names", "Array<string>"],
      ["promise", "Promise<number>"],
      ["myType", "MyType"],
      ["generics", "MyGene<number, string>"],
      ["array", "Array<number>"],
      ["opType", "Option<boolean>"]
    ]
    expects.forEach((t, index) => {
      const f = type.fields[index]
      expect(f.name).toBe(t[0])
      expect(f.type.toString()).toBe(t[1])
    })
  })
  test("Load class", () => {
    const loader = new TypeDefLoader()

    const types = loader.run(
      `
    import {Hoge} from "../Hoge"
    export class User { 
      id: string
      name = "hoge"

      get hoge(): Hoge {
        return new Hoge()
      }

      get haveGetterAndSetter(): string {
        return "aaa"
      }
      set haveGetterAndSetter(v: string) {
        // !
      }
      get withoutType() {
        return "aaa"
      }
      protected protectedField: number = 0
      private privateField: number = 0
    }`
    )
    const type = types.find((t) => t.name === "User")
    if (!type) {
      fail("Fail to parse User class")
    }
    const expects = [
      ["id", "string"],
      ["name", "any"], // 型注釈なしの場合はany扱い
      ["hoge", "Hoge"],
      ["haveGetterAndSetter", "string"],
      ["withoutType", "any"] // 型注釈なしの場合はany扱い
      // protectedとprivateは対象にならない
    ]
    expects.forEach((t, index) => {
      const f = type.fields[index]
      if (!f) {
        fail(`Field:${t[0]} not found in class User`)
      }
      expect(f.name).toBe(t[0])
      expect(f.type.toString()).toBe(t[1])
    })
  })
  test("Load abstract class", () => {
    const loader = new TypeDefLoader()

    const types = loader.run(
      `
    import {Hoge} from "../Hoge"
    export abstract class User { 
      id: string
      name = "hoge"

      abstract get hoge(): Hoge

      get haveGetterAndSetter(): string {
        return "aaa"
      }
      set haveGetterAndSetter(v: string) {
        // !
      }
      get withoutType() {
        return "aaa"
      }
      protected abstract get protectedField(): number
      private privateField: number = 0
    }`
    )
    const type = types.find((t) => t.name === "User")
    if (!type) {
      fail("Fail to parse User class")
    }
    const expects = [
      ["id", "string"],
      ["name", "any"], // 型注釈なしの場合はany扱い
      ["hoge", "Hoge"],
      ["haveGetterAndSetter", "string"],
      ["withoutType", "any"] // 型注釈なしの場合はany扱い
      // protectedとprivateは対象にならない
    ]
    expects.forEach((t, index) => {
      const f = type.fields[index]
      if (!f) {
        fail(`Field:${t[0]} not found in class User`)
      }
      expect(f.name).toBe(t[0])
      expect(f.type.toString()).toBe(t[1])
    })
  })
  test("Exclude methods", () => {
    const loader = new TypeDefLoader()
    const types = loader.run(
      `
    import {Hoge} from "../Hoge"
    export interface User { 
      methodWithoutArgs(): string
      methodWithArgs(id: string): string
      funcFieldWithoutArgs: () => string
      funcFieldWithArgs: (id: string) => string
    }`
    )
    const type = types.find((t) => t.name === "User")
    if (!type) {
      fail("Fail to parse User interface")
    }
    expect(type.fields.length).toBe(2)
    const expects = [
      ["methodWithoutArgs", "string"],
      ["funcFieldWithoutArgs", "string"]
    ]
    expects.forEach((t, index) => {
      const f = type.fields[index]
      expect(f.name).toBe(t[0])
      expect(f.type.toString()).toBe(t[1])
    })
  })
})
