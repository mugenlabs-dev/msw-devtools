---
"@mugenlabs/msw-devtools": minor
---

Variant ids are now stable instead of positional. A labelled variant gets an id derived from its label (for example `not-found-empty`); an unlabelled one gets an id derived from its handler. Reordering or inserting variants therefore no longer repoints persisted selections. Any unknown `activeVariantId` (including ids persisted by older versions) resolves to the first variant, both in the handler and in the panel, where it previously caused the mock to pass through. The helper is exported as `resolveActiveVariant`.
