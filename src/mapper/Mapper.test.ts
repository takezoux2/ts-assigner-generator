import * as assert from "assert"
import { Mapper } from "./Mapper"
import { TypeRef, TypeDef, Field } from "./TypeDef"

describe("Mapper", () => {
  test("Convert", () => {
    const mapper = new Mapper()

    const t1 = new TypeDef("Hoge").addFields([
      new Field("hoge", new TypeRef("", "string", []), false),
      new Field("hoge_fuga_aaa", new TypeRef("", "string", []), false),
      new Field("hoge", new TypeRef("", "string", []), false),
      new Field("userId", new TypeRef("", "string", []), false),
      new Field("tests", TypeRef.Array(new TypeRef("", "number", [])), false)
    ])
    const t2 = new TypeDef("Fuga").addFields([
      new Field("hoge", new TypeRef("", "string", []), false),
      new Field("hogeFugaAaa", new TypeRef("", "number", []), false),
      new Field("user", new TypeRef("", "string", []), false),
      new Field("testss", TypeRef.Array(new TypeRef("", "string", [])), false)
    ])

    expect(mapper.generate(t1, t2).replace(/\s/g, "")).toBe(
      `
    function HogeToFuga(from: Hoge): Fuga {
      return {
        hoge: from.hoge,
        hogeFugaAaa: Number(from.hoge_fuga_aaa),
        user: from.userId,
        testss: from.tests.map(e => String(e))
      }
    }`.replace(/\s/g, "")
    )
  })

  test("GetterMethod are called by func call", () => {
    const mapper = new Mapper()

    const t1 = new TypeDef("Hoge").addFields([
      new Field("getHoge", new TypeRef("", "string", []), true)
    ])
    const t2 = new TypeDef("Fuga").addFields([
      new Field("hoge", new TypeRef("", "string", []), false)
    ])

    expect(mapper.generate(t1, t2).replace(/\s/g, "")).toBe(
      `
    function HogeToFuga(from: Hoge): Fuga {
      return {
        hoge: from.getHoge()
      }
    }`.replace(/\s/g, "")
    )
  })

  test("Assign code is generated even if 'to' object only has getter field", () => {
    const mapper = new Mapper()

    const t1 = new TypeDef("Hoge").addFields([
      new Field("getHoge", new TypeRef("", "string", []), true)
    ])
    const t2 = new TypeDef("Fuga").addFields([
      new Field("getHoge", new TypeRef("", "string", []), true)
    ])

    expect(mapper.generate(t1, t2).replace(/\s/g, "")).toBe(
      `
    function HogeToFuga(from: Hoge): Fuga {
      return {
        getHoge: from.getHoge()
      }
    }`.replace(/\s/g, "")
    )
  })

  test("Edit distance", () => {
    const mapper = new Mapper()

    assert.strictEqual(mapper.levenshtein("aaaa", "aaaa"), 0)
    assert.strictEqual(mapper.levenshtein("aaaa", "aaa"), 1)
    assert.strictEqual(mapper.levenshtein("aaaa", "aaab"), 1)
    assert.strictEqual(mapper.levenshtein("aaaa", "aac"), 2)
    assert.strictEqual(mapper.levenshtein("aaaa", "aaaaa"), 1)
  })
})
