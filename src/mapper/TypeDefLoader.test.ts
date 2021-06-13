import { TypeDefLoader } from "./TypeDefLoader"

describe("TypeDefLoader", () => {
  test("Load", () => {
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
})
