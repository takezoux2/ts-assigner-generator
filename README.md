# ts-asigner README

TypeScriptのインターフェイス変換を行うコードを生成するVS Codeの拡張機能です

## Features

2つのインターフェイスを指定し、変換のための代入コードの雛形を生成します。コピペして利用してください。


次のような２つのインターフェイスがあったときに
```typescript
interface UserRequest {
  user_name: string
  role_ids: string[]
  created_at: string
}

interface UserUseCase {
  userName: string
  roleIds: number[]
  createdAt: Date 
}
```

```typescript
function UserRequestToUserUseCase(from: UserRequest): UserUseCase {
  return {
    userName: from.user_name,
    roleIds: from.role_ids.map(e => Number(e)),
    createdAt: new Date(created_at)
  }
}
```
のような変換コードを生成します。

## extensinoの使い方



## Limitation

このライブラリは代入コードの雛形を生成する拡張機能です。コンパイルエラーの無い完全なコードを生成することは目的にしていません。
なので、生成されたコードをコピペなどで移動して、適宜修正を行ってください。



## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

