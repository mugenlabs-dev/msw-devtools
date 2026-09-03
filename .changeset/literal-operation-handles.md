---
"@mugenlabs/msw-devtools": minor
---

Type operation handles from the defs passed to `registerRestMocks` / `registerGraphqlMocks`. The new return type `OperationHandlesFor<Defs>` is a tuple of `OperationHandle<Name>` that is also keyed by the literal `operationName`s, so `handles["typo"]` is now a compile-time error whenever every def has an explicit name. Defs relying on auto-derived names keep `string` keys. `OperationHandle` gains an optional `Name` type parameter; the untyped `OperationHandles` alias is unchanged.
