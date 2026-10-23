---
"@mugenlabs/msw-devtools": patch
---

Panel fixes:

- The delay is capped at 60 seconds, so a typo can no longer stall a request indefinitely. Saved delays above the cap are clamped when loaded.
- Operation rows no longer nest the enable toggle inside a `role="button"` element: each row now has a real select button and a separate toggle button, and the selected row is marked with `aria-current`.
- Operation rows are memoised effectively: the select and toggle callbacks are stable, so toggling one mock no longer re-renders every row.
- The Response JSON editor has an accessible label and sets `aria-invalid` while its content is not valid JSON.
