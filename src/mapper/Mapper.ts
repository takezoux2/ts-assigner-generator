import * as R from "ramda"
import { ConvertFunctionRepository } from "./ConvertFunctionRepository"
import { Field, TypeDef } from "./TypeDef"
import * as mustache from "mustache"

interface FieldMap {
  fromField: Field
  toField: Field
  mapCode: string
}

export class Mapper {
  constructor(
    private convertFunctionRepo: ConvertFunctionRepository = new ConvertFunctionRepository()
  ) {}

  generate(from: TypeDef, to: TypeDef) {
    const mappings: FieldMap[] = to.fields
      .map((f) => {
        return this.findField(f, from)
      })
      .filter((a) => a !== undefined) as FieldMap[]

    return `
function ${from.name}To${to.name}(from: ${from.name}): ${to.name} {
  return {
    ${mappings.map((f) => `${f.toField.name}: ${f.mapCode}`).join(",\n    ")}
  }
}    
    `
  }
  findField(toField: Field, from: TypeDef): FieldMap | undefined {
    const perfectMatch = from.fields.find((f) => f.name === toField.name)

    const renderCode = (fromField: Field) => {
      const f = this.convertFunctionRepo.getConvertFunction(
        fromField.type,
        toField.type
      )
      const fieldCall = fromField.isFunction
        ? `${fromField.name}()`
        : fromField.name
      return mustache.render(f, { param: `from.${fieldCall}` })
    }

    if (perfectMatch) {
      return {
        fromField: perfectMatch,
        toField: toField,
        mapCode: renderCode(perfectMatch)
      }
    }

    const matchField = from.fields
      .map((f) => {
        console.log(
          `${toField.name}:${f.name} -- ${this.levenshtein(
            toField.compareName,
            f.compareName
          )}`
        )
        return {
          distance: this.levenshtein(toField.compareName, f.compareName),
          field: f
        }
      })
      .filter((f) => f.distance <= 5)
      .sort((a, b) => a.distance - b.distance)[0]
    if (!matchField) return undefined
    console.log(`${toField.name} - ${JSON.stringify(matchField)}`)
    return {
      fromField: matchField.field,
      toField: toField,
      mapCode: renderCode(matchField.field)
    }
  }

  levenshtein(s1: string, s2: string): number {
    if (s1 === s2) {
      return 0
    }
    const len1 = s1.length
    const len2 = s2.length
    const dp = new Array<number[]>(len2 + 1)
    for (let i = 0; i <= len2; i++) {
      dp[i] = new Array<number>(len1 + 1).fill(0)
    }
    // dp[0][0] = 0;
    for (let i = 1; i <= len1; ++i) {
      dp[0][i] = i
    }
    for (let i = 1; i <= len2; ++i) {
      dp[i][0] = i
    }
    for (let i = 1; i <= len2; ++i) {
      for (let j = 1; j <= len1; ++j) {
        if (s1.charAt(j - 1) == s2.charAt(i - 1)) {
          dp[i][j] = dp[i - 1][j - 1]
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1,
            Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1)
          )
        }
      }
    }
    return dp[len2][len1]
  }
}
