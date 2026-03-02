# Neutralinojs Migration Design — Phase 1

**Date:** 2026-03-02
**Goal:** 将 Todo List 从 Electron 迁移到 Neutralinojs，预期产物 3-5MB（对比 Electron 62MB）

## Scope (Phase 1)

- 主窗口（全部 CRUD + 筛选/排序/主题）
- 系统托盘（右键菜单：显示/新建/退出）
- 系统通知（deadline 到期提醒）
- 数据持久化（JSON 文件存储）

**NOT in scope:** Widget 浮层窗口（Phase 2）

## Architecture

```
todolist-neu/
  neutralino.config.json    # 配置文件
  resources/
    index.html              # 主窗口 HTML
    css/
      variables.css         # 主题变量（复用）
      base.css              # 基础样式（复用）
      layout.css            # 布局（复用）
      components.css        # 组件（复用）
    js/
      store.js              # 数据层（Neutralino.filesystem）
      tray.js               # 托盘（Neutralino.os.setTray）
      notifications.js      # 通知（Neutralino.os.showNotification）
      app.js                # 主入口（复用 + 改造）
      todo-list.js          # 列表渲染（100% 复用）
      todo-form.js          # 表单模态框（复用 + 改造 IPC）
      filter-bar.js         # 筛选栏（100% 复用）
      tag-manager.js        # 标签管理（复用 + 改造 IPC）
      theme-toggle.js       # 主题切换（复用 + 改造存储）
      utils.js              # 工具函数（100% 复用）
    icons/
      tray-icon.png         # 托盘图标
      icon.png              # 窗口图标
```

## Key Mapping

### Data Layer (store.js)
- `app.getPath('userData')` → `Neutralino.os.getPath('data')` + app subfolder
- `fs.readFileSync` / `fs.writeFileSync` → `Neutralino.filesystem.readFile` / `writeFile`
- `fs.existsSync` → try/catch `Neutralino.filesystem.getStats`

### System Tray (tray.js)
- `new Tray()` + `tray.setContextMenu()` → `Neutralino.os.setTray({ icon, menuItems })`
- tray click events → `Neutralino.events.on('trayMenuItemClicked', ...)`

### Notifications (notifications.js)
- `new Notification()` → `Neutralino.os.showNotification(title, content, icon)`
- No click callback available — limitation accepted

### Close-to-Tray
- `mainWindow.on('close', preventDefault)` → `Neutralino.events.on('windowClose', ...)`
- Call `Neutralino.window.hide()` instead of closing

### IPC Replacement
- No IPC needed — frontend JS directly calls `Neutralino.*` APIs
- `window.api.getTodos()` → `Store.getAllTodos()` (direct function call)
