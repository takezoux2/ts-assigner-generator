export interface ImportName {
  typeName: string
  fullPath: string
}
export interface ImportNamespace {
  namespace: string
  fullPath: string
}

export interface TypeDef {
  name: string
  fields: Field[]
}
export interface Field {
  name: string
  type: TypeRef
  compareName: string
}

const ArrayType = "Array"
const PromiseType = "Promise"

export class TypeRef {
  static Array(baseType: TypeRef) {
    return new TypeRef("", ArrayType, [baseType])
  }
  static Promise(baseType: TypeRef) {
    return new TypeRef("", PromiseType, [baseType])
  }

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
    if (this.typeName === ArrayType || this.typeName === PromiseType) {
      return this.generics[0].stripType()
    } else {
      return this.typeName
    }
  }
}
