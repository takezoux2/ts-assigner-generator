import * as assert from "assert"
import { Mapper } from "./Mapper"
import { TypeRef } from "./TypeDef"

describe("Mapper", () => {
  test("Convert", () => {
    const mapper = new Mapper()

    console.log(
      mapper.generate(
        {
          name: "Hoge",
          fields: [
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
          ]
        },
        {
          name: "Fuga",
          fields: [
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
          ]
        }
      )
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
