import { TypeDefLoader } from "./mapper/TypeDefLoader"

const l = new TypeDefLoader()

l.run(`
interface User {
  name?: string
  id: number
  roles: Role[]
  getName: () => string
}

interface Role {
  id: number,
  name: string
}

`)
