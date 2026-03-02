# Widget Quick Add Todo — Design Document

**Date:** 2026-03-02
**Status:** Approved

## Overview

Add a quick-add form to the desktop Widget (floating overlay) so users can create new todo items without switching to the main window.

## Chosen Approach: Header Inline Form with Deadline

A `+` button in the Widget header toggles a compact two-line form (title + optional deadline). This balances discoverability with minimal space usage.

## UI Layout

```
+─────────────────────────────────+
│ Upcoming Deadlines          [+] │  ← Header with toggle button
├─────────────────────────────────┤
│ [  Type a todo title...      ] │  ← Title input (required)
│ [Pick deadline...    ] [Create] │  ← Deadline (optional) + submit
├─────────────────────────────────┤
│ ○ Buy groceries         3d     │  ← Existing todo list
│ ◔ Write report          1d     │
+─────────────────────────────────+
```

### Default state
- `+` button visible in header right side
- Form hidden

### Expanded state
- Two-row form slides in below header (~88px)
- Title input auto-focused
- `+` rotates 45deg to become `×` close icon

## Interaction

| Action | Behavior |
|--------|----------|
| Click `+` | Toggle form open/close, auto-focus title |
| Title + Enter | Create todo if title non-empty, clear form, keep open |
| Click "Create" | Same as Enter |
| Enter (empty title) | No-op |
| Esc | Close form |
| Click outside form | Close form |
| Click `+` again | Close form (toggle) |

## Created Todo Defaults

| Field | Value |
|-------|-------|
| title | User input (required) |
| deadline | User selected or `null` |
| status | `未开始` |
| tagIds | `[]` |
| description | `''` |

## Data Flow

```
widget.js (renderer)
  → widgetApi.createTodo({ title, deadline })
    → widget-preload.js (IPC bridge)
      → ipcRenderer.invoke('widget:createTodo', data)
        → main.js (IPC handler)
          → store.createTodo(data)
          → sendWidgetUpdate()  // refresh widget list
          → mainWindow.webContents.send('todos:changed')  // sync main window
```

## Sync Behavior

1. **Widget list:** Refreshes immediately after creation. Todos with deadlines appear in the widget list.
2. **Main window:** Receives `todos:changed` event and reloads its todo list.

## Files to Modify

| File | Changes |
|------|---------|
| `renderer/widget.html` | Add `+` button in header, add form section |
| `renderer/css/widget.css` | Styles for button, form, expand/collapse animations |
| `renderer/js/widget.js` | Form toggle logic, create todo handler |
| `preload/widget-preload.js` | Add `createTodo(data)` API |
| `main/main.js` | Add `widget:createTodo` IPC handler, main window sync |
| `renderer/js/app.js` | Listen for `todos:changed` and refresh list |
| `preload/preload.js` | Expose `onTodosChanged` listener |

## Animation Details

- **Form expand:** `max-height` 0→88px, `opacity` 0→1, 200ms ease-out
- **Form collapse:** Reverse, 150ms ease-in
- **`+` button:** Rotates 45deg when expanded (becomes ×)
- **Success feedback:** Inline "Added" text replaces placeholder briefly (800ms fade)

## Alternatives Considered

1. **Bottom floating input bar** — Permanently occupies space; rejected because widget is only 360px tall.
2. **Double-click empty area** — Poor discoverability; rejected.
