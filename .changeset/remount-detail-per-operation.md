---
"@mugenlabs/msw-devtools": patch
---

Remount the operation detail pane when a different operation is selected. Previously a pending JSON edit could be dropped, and invalid text from the previous operation could stay on screen, when switching operations mid-edit.
