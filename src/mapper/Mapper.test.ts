import * as assert from "assert"
import { Mapper } from "./Mapper"
import { TypeRef, TypeDef } from "./TypeDef"

describe("Mapper", () => {
  test("Convert", () => {
    const mapper = new Mapper()

    const t1 = new TypeDef("Hoge").addFields([
      {
        name: "hoge",
        type: new TypeRef("", "string", []),
        compareName: "hoge"
      },
      {
        name: "hoge_fuga_aaa",
        type: new TypeRef("", "string", []),
        compareName: "hoge_fuga_aaa".replace("_", "").toLowerCase()
      },
      {
        name: "userId",
        type: new TypeRef("", "string", []),
        compareName: "userId".toLowerCase()
      },
      {
        name: "tests",
        type: TypeRef.Array(new TypeRef("", "number", [])),
        compareName: "tests".toLowerCase()
      }
    ])
    const t2 = new TypeDef("Fuga").addFields([
      {
        name: "hoge",
        type: new TypeRef("", "string", []),
        compareName: "hoge"
      },
      {
        name: "hogeFugaAaa",
        type: new TypeRef("", "number", []),
        compareName: "hogeFugaAaa".toLowerCase()
      },
      {
        name: "user",
        type: new TypeRef("", "string", []),
        compareName: "user".toLowerCase()
      },
      {
        name: "testss",
        type: TypeRef.Array(new TypeRef("", "string", [])),
        compareName: "testss".toLowerCase()
      }
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

  test("Edit distance", () => {
    const mapper = new Mapper()

    assert.strictEqual(mapper.levenshtein("aaaa", "aaaa"), 0)
    assert.strictEqual(mapper.levenshtein("aaaa", "aaa"), 1)
    assert.strictEqual(mapper.levenshtein("aaaa", "aaab"), 1)
    assert.strictEqual(mapper.levenshtein("aaaa", "aac"), 2)
    assert.strictEqual(mapper.levenshtein("aaaa", "aaaaa"), 1)
  })
})
