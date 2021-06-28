export interface ImportName {
  typeName: string
  fullPath: string
}
export interface ImportNamespace {
  namespace: string
  fullPath: string
}

export class TypeDef {
  fields: Field[] = []
  constructor(public name: string) {}

  addField(field: Field) {
    this.fields.push(field)
    return this
  }
  addFields(fields: Field[]) {
    this.fields = this.fields.concat(fields)
    return this
  }
}
export class Field {
  static getCompareName(name: string): string {
    if (name.startsWith("getter")) {
      return this.getCompareName(name.substring(3))
    } else {
      return name.replace("_", "").toLowerCase()
    }
  }

  compareName: string
  constructor(
    public name: string,
    public type: TypeRef,
    public isFunction: boolean
  ) {
    this.compareName = Field.getCompareName(name)
  }
}

const ArrayType = "Array"
const PromiseType = "Promise"
const OptionType = "Option"

export class TypeRef {
  static Array(baseType: TypeRef) {
    return new TypeRef("", ArrayType, [baseType])
  }
  static Promise(baseType: TypeRef) {
    return new TypeRef("", PromiseType, [baseType])
  }
  static Option(baseType: TypeRef) {
    return new TypeRef("", OptionType, [baseType])
  }
  static create(name: string, generics: TypeRef[] = []) {
    return new TypeRef("", name, generics)
  }
  static Any = new TypeRef("", "any", [])

  constructor(
    public namespace: string,
    public typeName: string,
    public generics: TypeRef[]
  ) {}

  get isArray() {
    return this.typeName === ArrayType
  }
  get isPromise() {
    return this.typeName === PromiseType
  }

  stripType(): string {
    if (
      this.typeName === ArrayType ||
      this.typeName === PromiseType ||
      this.typeName === OptionType
    ) {
      return this.generics[0].stripType()
    } else {
      return this.typeName
    }
  }

  toString(): string {
    if (this.generics.length > 0) {
      return `${this.typeName}<${this.generics
        .map((g) => g.toString())
        .join(", ")}>`
    } else {
      return this.typeName
    }
  }
}
