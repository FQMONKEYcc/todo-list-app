# Todo List 开发者指南

> 本项目是一个桌面端 Todo List 应用，同时提供 **Electron** 和 **Neutralinojs** 两个实现版本。两者共享相同的业务逻辑和 UI 设计，但在底层架构、进程模型和打包方式上存在显著差异。

---

## 目录

1. [技术架构概览](#1-技术架构概览)
2. [项目目录结构说明](#2-项目目录结构说明)
3. [开发环境搭建](#3-开发环境搭建)
4. [核心模块详解](#4-核心模块详解)
5. [打包和发布流程](#5-打包和发布流程)
6. [贡献指南](#6-贡献指南)

---

## 1. 技术架构概览

### 1.1 双版本架构对比

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Todo List 应用                               │
├─────────────────────────────┬───────────────────────────────────────┤
│     Electron 版本            │     Neutralinojs 版本                 │
│     (electron-version/)     │     (neutralino-version/)             │
├─────────────────────────────┼───────────────────────────────────────┤
│  Electron 33 + Chromium     │  Neutralinojs 6.5 + 系统 WebView2    │
│  electron-builder 25        │  neu CLI 构建工具                     │
│  ~85MB 打包体积              │  ~3MB 打包体积                        │
│  ~1817 行 JS                │  ~3699 行 JS+CSS                     │
├─────────────────────────────┼───────────────────────────────────────┤
│  多进程架构                   │  单进程 + 轻量原生层                   │
│  Main / Renderer / Preload  │  资源文件直接加载                      │
│  Node.js 完整运行时          │  Neutralino Native API               │
│  IPC 双向通信                │  事件系统 + 原生 API 调用              │
└─────────────────────────────┴───────────────────────────────────────┘
```

### 1.2 Electron 版本架构

```
┌──────────────────────────────────────────────────────────┐
│                   Electron Main Process                   │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐ │
│  │ main.js  │ │ store.js │ │notifications│ │  tray.js │ │
│  │ 窗口管理  │ │ 数据持久化│ │  截止日期    │ │ 系统托盘  │ │
│  │ Widget   │ │ JSON文件  │ │  提醒通知    │ │ 右键菜单  │ │
│  └────┬─────┘ └────┬─────┘ └──────┬──────┘ └──────────┘ │
│       │            │               │                      │
│  ┌────┴────────────┴───────────────┴───┐                 │
│  │       ipc-handlers.js               │                 │
│  │  IPC 通道注册（todos/tags/settings） │                 │
│  └─────────────────┬───────────────────┘                 │
├────────────────────┼─────────────────────────────────────┤
│    Preload Layer   │  contextBridge 安全桥接               │
│  ┌─────────────────┴────────────────┐                    │
│  │ preload.js    widget-preload.js  │                    │
│  │ window.api    window.widgetApi   │                    │
│  └─────────────────┬────────────────┘                    │
├────────────────────┼─────────────────────────────────────┤
│  Renderer Process  │  contextIsolation: true              │
│  ┌─────────────────┴────────────────┐                    │
│  │  app.js / todo-list.js / ...     │                    │
│  │  HTML + CSS + Vanilla JS         │                    │
│  │  通过 window.api 调用主进程       │                    │
│  └──────────────────────────────────┘                    │
└──────────────────────────────────────────────────────────┘
```

**关键设计决策：**
- 启用 `contextIsolation: true` 和 `nodeIntegration: false`，确保渲染进程安全沙箱隔离
- 所有主进程能力通过 `contextBridge` 暴露为 `window.api` 和 `window.widgetApi`
- IPC 通信采用 `ipcMain.handle` / `ipcRenderer.invoke` 的请求-响应模式

### 1.3 Neutralinojs 版本架构

```
┌──────────────────────────────────────────────────────────┐
│              Neutralinojs 运行时                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  轻量原生层 (C++ 二进制)                           │    │
│  │  - 系统 WebView2 渲染引擎                         │    │
│  │  - 原生 API: filesystem / os / storage / window  │    │
│  │  - 内置 HTTP 服务器提供静态资源                    │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │ Neutralino JS Client API         │
│  ┌────────────────────┴─────────────────────────────┐    │
│  │              前端资源 (resources/)                 │    │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────────┐       │    │
│  │  │ app.js  │ │store.js │ │ widget-store │       │    │
│  │  │ 应用主  │ │ 数据层   │ │  Widget专用   │       │    │
│  │  │ 逻辑    │ │Neutralino│ │  轻量存储     │       │    │
│  │  │         │ │filesystem│ │              │       │    │
│  │  └─────────┘ └─────────┘ └──────────────┘       │    │
│  │  ┌────────────────────────────────────────┐      │    │
│  │  │  UI 模块: filter-bar / tag-manager /   │      │    │
│  │  │  theme-toggle / todo-form / todo-list  │      │    │
│  │  └────────────────────────────────────────┘      │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

**关键设计决策：**
- 无需 Preload 桥接层，前端直接调用 `Neutralino.*` API
- 数据存储使用 `Neutralino.filesystem` 读写 JSON 文件（存储在系统 AppData 目录）
- Widget 窗口通过 `Neutralino.window.create()` 创建独立子进程，使用事件广播通信
- 二进制体积极小（~3MB），利用系统自带 WebView2 渲染

---

## 2. 项目目录结构说明

```
todolist/
├── docs/                          # 项目文档
│   ├── CHANGELOG.md               # 更新日志
│   ├── DEVELOPER_GUIDE.md         # 本文件 — 开发者指南
│   └── plans/                     # 规划文档
│
├── electron-version/              # ===== Electron 版本 =====
│   ├── package.json               # 项目依赖与构建脚本
│   ├── main/                      # 主进程代码
│   │   ├── main.js                # 应用入口：窗口管理、Widget 创建、生命周期
│   │   ├── store.js               # 数据持久化：JSON 文件 CRUD、防抖保存
│   │   ├── ipc-handlers.js        # IPC 通道注册：todos/tags/settings
│   │   ├── tray.js                # 系统托盘：图标、右键菜单
│   │   └── notifications.js       # 截止日期提醒：定时检查、系统通知
│   ├── renderer/                  # 渲染进程代码
│   │   ├── index.html             # 主窗口 HTML
│   │   ├── widget.html            # Widget 悬浮窗 HTML
│   │   ├── css/                   # 样式文件
│   │   │   ├── variables.css      # CSS 变量 / 主题 token（亮色 + 暗色）
│   │   │   ├── base.css           # 基础样式 / 重置
│   │   │   ├── layout.css         # 布局样式（侧边栏、网格）
│   │   │   ├── components.css     # 组件样式（按钮、表单、卡片）
│   │   │   └── widget.css         # Widget 悬浮窗样式
│   │   └── js/                    # 前端 JavaScript 模块
│   │       ├── app.js             # 应用入口、数据加载、事件绑定
│   │       ├── todo-list.js       # Todo 列表渲染、状态切换、高亮
│   │       ├── todo-form.js       # 新建/编辑 Todo 表单（模态框）
│   │       ├── filter-bar.js      # 筛选栏：状态、标签、搜索、排序、日期范围
│   │       ├── tag-manager.js     # 标签管理器（CRUD 模态框）
│   │       ├── theme-toggle.js    # 主题切换（亮色/暗色）+ 动画
│   │       ├── widget.js          # Widget 前端逻辑
│   │       └── utils.js           # 工具函数
│   ├── preload/                   # 预加载脚本
│   │   ├── preload.js             # 主窗口 preload → window.api
│   │   └── widget-preload.js      # Widget preload → window.widgetApi
│   ├── assets/                    # 静态资源
│   │   └── icons/                 # 应用图标（icon.ico, tray-icon.png）
│   ├── scripts/                   # 构建辅助脚本
│   │   ├── package-release.js     # 发布打包（7z/zip 压缩）
│   │   ├── after-pack.js          # electron-builder 后置钩子
│   │   └── generate-icon.js       # 图标生成
│   └── dist/                      # 构建产物（git 忽略）
│
├── neutralino-version/            # ===== Neutralinojs 版本 =====
│   ├── neutralino.config.json     # Neutralinojs 配置（窗口、权限、CLI）
│   ├── resources/                 # 前端资源（等同于 Web 根目录）
│   │   ├── index.html             # 主窗口 HTML
│   │   ├── widget.html            # Widget 悬浮窗 HTML
│   │   ├── css/                   # 样式文件（结构同 Electron 版本）
│   │   │   ├── variables.css
│   │   │   ├── base.css
│   │   │   ├── layout.css
│   │   │   ├── components.css
│   │   │   └── widget.css
│   │   ├── js/                    # 前端 JavaScript 模块
│   │   │   ├── main.js            # Neutralino 初始化、托盘、事件
│   │   │   ├── app.js             # 应用主逻辑、Widget、通知、快捷键
│   │   │   ├── store.js           # 数据层（Neutralino.filesystem）
│   │   │   ├── widget-store.js    # Widget 专用轻量存储
│   │   │   ├── neutralino.js      # Neutralino JS Client 库
│   │   │   ├── filter-bar.js      # 筛选栏
│   │   │   ├── tag-manager.js     # 标签管理
│   │   │   ├── theme-toggle.js    # 主题切换
│   │   │   ├── todo-form.js       # Todo 表单
│   │   │   ├── todo-list.js       # Todo 列表
│   │   │   ├── utils.js           # 工具函数
│   │   │   └── widget.js          # Widget 前端逻辑
│   │   └── icons/                 # 应用图标
│   ├── bin/                       # Neutralino 二进制文件（多平台）
│   │   ├── neutralino-win_x64.exe
│   │   ├── neutralino-linux_x64
│   │   ├── neutralino-mac_x64
│   │   └── ...                    # arm64, armhf, universal 等
│   └── dist/                      # 构建产物
│       └── TodoList/              # 各平台可执行文件 + resources.neu
│
├── release/                       # 发布归档
│   ├── electron/                  # Electron 发布包
│   │   ├── TodoList-v1.0.0-win-x64-portable.7z
│   │   └── TodoList-v1.0.0-win-x64-portable.zip
│   └── neutralino/                # Neutralinojs 发布包
│
└── node_modules/                  # npm 依赖（git 忽略）
```

---

## 3. 开发环境搭建

### 3.1 前置要求

| 工具 | 最低版本 | 用途 |
|------|----------|------|
| Node.js | 18+ | Electron 版本运行时 & npm 包管理 |
| npm | 9+ | 依赖安装（随 Node.js 一起安装） |
| Neutralino CLI (`@neutralinojs/neu`) | 最新版 | Neutralinojs 版本开发与构建 |
| Git | 2.x | 版本控制 |
| 7-Zip（可选） | 任意 | 发布包压缩（提供更好的压缩率） |

### 3.2 Electron 版本

```bash
# 1. 进入 Electron 版本目录
cd electron-version

# 2. 安装依赖
npm install

# 3. 启动开发模式
npm start
# 等效于: electron .

# 4. 构建便携版（生成到 dist/）
npm run build
# 等效于: electron-builder --win

# 5. 构建目录版 + 打包发布归档
npm run build:release
# 等效于: electron-builder --win --dir && node scripts/package-release.js
```

**可用的 npm 脚本：**

| 脚本 | 命令 | 说明 |
|------|------|------|
| `start` | `electron .` | 启动应用（开发模式） |
| `build` | `electron-builder --win` | 构建 Windows 便携版 exe |
| `build:dir` | `electron-builder --win --dir` | 构建到目录（不打包为单文件） |
| `build:release` | `build:dir` + `package-release.js` | 构建 + 压缩为发布归档 |

### 3.3 Neutralinojs 版本

```bash
# 1. 全局安装 Neutralino CLI（如果尚未安装）
npm install -g @neutralinojs/neu

# 2. 进入 Neutralinojs 版本目录
cd neutralino-version

# 3. 启动开发模式（自动热重载）
neu run

# 4. 构建所有平台
neu build
# 产物输出到 dist/TodoList/ 目录
```

**Neutralinojs 配置说明（neutralino.config.json）：**

| 配置项 | 值 | 说明 |
|--------|------|------|
| `applicationId` | `com.todolist.app` | 应用唯一标识 |
| `defaultMode` | `window` | 默认以窗口模式运行 |
| `tokenSecurity` | `one-time` | 一次性安全令牌 |
| `nativeAllowList` | `app.*`, `os.*`, `filesystem.*`, ... | 允许的原生 API 列表 |
| `cli.binaryVersion` | `6.5.0` | Neutralino 二进制版本 |
| `cli.clientVersion` | `6.5.0` | JS Client 版本 |
| `modes.window.width` | `1000` | 窗口宽度 |
| `modes.window.height` | `700` | 窗口高度 |

### 3.4 调试技巧

**Electron 版本：**
- 在 `main.js` 的 `createWindow()` 中添加 `mainWindow.webContents.openDevTools()` 打开 DevTools
- 主进程日志直接输出到启动终端
- 渲染进程日志在 DevTools Console 中查看

**Neutralinojs 版本：**
- 配置中已启用 `enableInspector: true`，可在浏览器中打开调试器
- `logging.enabled: true` 和 `writeToLogFile: true` 已开启日志写入文件
- 使用 `Neutralino.debug.log()` 输出调试信息

---

## 4. 核心模块详解

### 4.1 Store 数据层

Store 是两个版本的核心模块，负责所有数据的持久化存储。两者的数据结构完全一致，仅 I/O 实现不同。

**数据文件路径：**
- Electron：`{userData}/todos.json`（Windows 上为 `%APPDATA%/todolist/todos.json`）
- Neutralinojs：`{os.getPath('data')}/TodoList/todos.json`

**数据结构（todos.json）：**

```json
{
  "version": 1,
  "tags": [
    { "id": "tag_default_1", "name": "Work", "color": "#4a90d9" },
    { "id": "tag_default_2", "name": "Personal", "color": "#27ae60" },
    { "id": "tag_default_3", "name": "Urgent", "color": "#e74c3c" }
  ],
  "todos": [
    {
      "id": "todo_1709000000000_a1b2c",
      "title": "任务标题",
      "description": "任务描述",
      "status": "未开始",
      "deadline": "2024-03-15T10:00:00.000Z",
      "tagIds": ["tag_default_1"],
      "createdAt": "2024-03-01T08:00:00.000Z",
      "updatedAt": "2024-03-01T08:00:00.000Z",
      "completedAt": null,
      "notifiedAt": null
    }
  ],
  "settings": {
    "theme": "dark",
    "sortBy": "deadline",
    "sortOrder": "asc",
    "filterStatus": "all",
    "filterTagIds": [],
    "closeAction": "ask",
    "filterDateRange": "all"
  }
}
```

**Todo 状态值：** `"未开始"` | `"进行中"` | `"已完成"`

**ID 生成规则：** `{类型前缀}_{时间戳}_{随机字符串}`，例如 `todo_1709000000000_a1b2c`、`tag_1709000000000_x3y4z`

**防抖保存机制：**

两个版本都实现了 300ms 的防抖写入（`scheduleSave`），避免频繁操作时的大量磁盘 I/O：

```javascript
// 共同的防抖逻辑
scheduleSave() {
  if (this.saveTimer) clearTimeout(this.saveTimer);
  this.saveTimer = setTimeout(() => {
    this.writeDataSync();  // 实际写入磁盘
  }, 300);
}
```

**Electron 版本的安全写入：** 采用先写临时文件再 `rename` 的原子操作策略，防止写入中断导致数据损坏：

```javascript
// store.js — 原子写入
const tmpPath = dataPath + '.tmp';
fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
fs.renameSync(tmpPath, dataPath);  // 原子替换
```

**CRUD 接口一览：**

| 操作 | Electron（store.js 导出） | Neutralinojs（Store 对象方法） |
|------|--------------------------|-------------------------------|
| 初始化 | `init()` | `async init()` |
| 获取所有 Todo | `getAllTodos()` | `getAllTodos()` |
| 创建 Todo | `createTodo(data)` | `createTodo(data)` |
| 更新 Todo | `updateTodo(id, updates)` | `updateTodo(id, updates)` |
| 删除 Todo | `deleteTodo(id)` | `deleteTodo(id)` |
| 获取所有标签 | `getAllTags()` | `getAllTags()` |
| 创建标签 | `createTag(data)` | `createTag(data)` |
| 更新标签 | `updateTag(id, updates)` | `updateTag(id, updates)` |
| 删除标签 | `deleteTag(id)` | `deleteTag(id)` |
| 获取设置 | `getSettings()` | `getSettings()` |
| 更新设置 | `updateSettings(updates)` | `updateSettings(updates)` |
| 最近截止 Todo | `getNearestDeadlineTodos(count)` | `getNearestDeadlineTodos(count)` |

### 4.2 Widget 组件

Widget 是一个悬浮在桌面右下角的小窗口，显示即将到期的 Todo 列表，支持快速创建和完成任务。

**Electron 版本的 Widget：**

```
主进程 (main.js)                    Widget 窗口 (widget.html)
┌────────────────────┐              ┌─────────────────────────┐
│ createWidgetWindow()│              │  widget-preload.js      │
│ - 无边框、透明窗口  │◄─────────────│  window.widgetApi       │
│ - 320x360px        │  IPC 通信     │  ├ getInitialData()     │
│ - 桌面右下角定位    │──────────────►│  ├ completeTodo(id)     │
│ showWidget()       │              │  ├ createTodo(data)     │
│ hideWidget()       │              │  └ onTodosUpdate(cb)    │
│ sendWidgetUpdate() │              └─────────────────────────┘
│ - 60s 定时刷新     │
└────────────────────┘
```

- 主窗口最小化或关闭到托盘时自动显示 Widget
- 主窗口恢复时自动隐藏 Widget
- 每 60 秒自动向 Widget 推送最新数据
- Widget 完成任务后会同步通知主窗口刷新

**Neutralinojs 版本的 Widget：**

```
主窗口 (app.js)                     Widget 子进程 (widget.html)
┌────────────────────┐              ┌─────────────────────────┐
│ showWidget()       │              │  widget-store.js        │
│ - Neutralino       │  独立子进程   │  - 直接读写 todos.json  │
│   .window.create() │──────────────►│  - getNearestDeadline  │
│ - 记录进程 PID     │              │    Todos()              │
│ - 事件广播通信     │◄─────────────│  - createTodo()         │
│ quitApp()          │  widgetClosed │  - completeTodo()       │
│ - taskkill / kill  │   事件广播    │                         │
└────────────────────┘              └─────────────────────────┘
```

- Widget 是独立的 Neutralino 子进程，拥有独立的 `WidgetStore` 直接读写数据文件
- 通过 `Neutralino.events.broadcast()` 进行进程间通信
- 退出时通过 OS 命令（`taskkill`/`kill`）强制关闭子进程

### 4.3 主题系统

应用支持亮色（light）和暗色（dark）两套主题，基于 CSS 变量实现零 JavaScript 渲染开销的主题切换。

**CSS 变量体系（variables.css）：**

```css
/* 根级布局 token */
:root {
    --card-radius: 20px;
    --card-radius-sm: 12px;
    --grid-gap: 16px;
    --sidebar-width: 260px;
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 亮色主题 */
[data-theme="light"] {
    --bg: #F5F5F7;
    --text: #1D1D1F;
    --primary: #6366F1;
    --gradient-primary: linear-gradient(135deg, #6366F1, #8B5CF6);
    /* ... */
}

/* 暗色主题 */
[data-theme="dark"] {
    --bg: #0F0F1A;
    --text: #E2E8F0;
    --primary: #818CF8;
    --gradient-primary: linear-gradient(135deg, #818CF8, #A78BFA);
    /* ... */
}
```

**变量分类：**

| 分类 | 变量示例 | 说明 |
|------|----------|------|
| 背景色 | `--bg`, `--bg-card`, `--bg-modal` | 不同层级的背景色 |
| 文字色 | `--text`, `--text-secondary`, `--text-muted` | 主要/次要/辅助文字 |
| 边框色 | `--border`, `--border-light` | 分隔线和边框 |
| 主题色 | `--primary`, `--accent`, `--gradient-primary` | 品牌色和渐变 |
| 阴影 | `--shadow-sm` 到 `--shadow-xl` | 不同层级的投影 |
| 状态色 | `--status-pending`, `--status-progress`, `--status-done` | Todo 状态标识 |
| 截止色 | `--deadline-warning`, `--deadline-overdue` | 截止日期警示 |

**切换原理：**

```javascript
// ThemeToggle 模块
// 1. 通过 data-theme 属性切换主题
document.documentElement.setAttribute('data-theme', this.currentTheme);

// 2. 持久化到 settings
await window.api.updateSettings({ theme: this.currentTheme });
```

主题偏好保存在 `settings.theme` 中，应用启动时自动加载。

### 4.4 IPC 通信（Electron 版本专有）

Electron 的安全模型要求渲染进程通过 Preload 脚本桥接才能访问主进程能力。

**通信架构：**

```
渲染进程 (renderer)          Preload 层              主进程 (main)
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│                  │    │ contextBridge    │    │ ipcMain.handle   │
│ window.api       │    │                  │    │                  │
│  .getTodos()  ───┼───►│ ipcRenderer     ├───►│ 'todos:getAll'   │
│  .createTodo()───┼───►│  .invoke()      ├───►│ 'todos:create'   │
│  .updateTodo()───┼───►│                  ├───►│ 'todos:update'   │
│  .deleteTodo()───┼───►│                  ├───►│ 'todos:delete'   │
│                  │    │                  │    │                  │
│  .getTags()   ───┼───►│                  ├───►│ 'tags:getAll'    │
│  .createTag() ───┼───►│                  ├───►│ 'tags:create'    │
│  .updateTag() ───┼───►│                  ├───►│ 'tags:update'    │
│  .deleteTag() ───┼───►│                  ├───►│ 'tags:delete'    │
│                  │    │                  │    │                  │
│  .getSettings()──┼───►│                  ├───►│ 'settings:get'   │
│  .updateSettings─┼───►│                  ├───►│ 'settings:update'│
│                  │    │                  │    │                  │
│  .onNewTodo(cb) ◄┼────│ ipcRenderer.on  │◄───│ webContents.send │
│  .onTodosChanged◄┼────│ 'todos:changed' │◄───│ 'todos:changed'  │
│  .onNotification◄┼────│ 'notification:  │◄───│ 'notification:   │
│    Click(cb)     │    │  clicked'       │    │  clicked'        │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

**IPC 通道清单：**

| 通道名称 | 方向 | 类型 | 说明 |
|----------|------|------|------|
| `todos:getAll` | 渲染 -> 主 | invoke/handle | 获取所有 Todo |
| `todos:create` | 渲染 -> 主 | invoke/handle | 创建 Todo |
| `todos:update` | 渲染 -> 主 | invoke/handle | 更新 Todo（传入 id + updates） |
| `todos:delete` | 渲染 -> 主 | invoke/handle | 删除 Todo（传入 id） |
| `tags:getAll` | 渲染 -> 主 | invoke/handle | 获取所有标签 |
| `tags:create` | 渲染 -> 主 | invoke/handle | 创建标签 |
| `tags:update` | 渲染 -> 主 | invoke/handle | 更新标签 |
| `tags:delete` | 渲染 -> 主 | invoke/handle | 删除标签 |
| `settings:get` | 渲染 -> 主 | invoke/handle | 获取设置 |
| `settings:update` | 渲染 -> 主 | invoke/handle | 更新设置 |
| `widget:getInitialData` | Widget -> 主 | invoke/handle | Widget 获取初始数据 |
| `widget:completeTodo` | Widget -> 主 | invoke/handle | Widget 完成任务 |
| `widget:createTodo` | Widget -> 主 | invoke/handle | Widget 创建任务 |
| `widget:close` | Widget -> 主 | send/on | Widget 请求关闭 |
| `widget:todosUpdate` | 主 -> Widget | send | 推送 Todo 更新到 Widget |
| `action:newTodo` | 主 -> 渲染 | send | 托盘菜单触发新建 Todo |
| `todos:changed` | 主 -> 渲染 | send | 通知渲染进程数据已变更 |
| `notification:clicked` | 主 -> 渲染 | send | 通知点击，跳转到对应 Todo |

### 4.5 通知系统

**Electron 版本（notifications.js）：**

定时检查器每 60 秒运行一次，根据截止时间距离发送不同级别的通知：

| 时间距离 | 通知级别 | 重复间隔 | 说明 |
|----------|----------|----------|------|
| 已过期 | `critical` | 每 30 分钟 | 持续提醒直到完成 |
| < 30 分钟 | `warning` | 每 15 分钟 | 紧急提醒 |
| 30-60 分钟 | `info` | 仅一次 | 预告提醒 |

**Neutralinojs 版本（app.js 内嵌）：**

| 时间距离 | 通知级别 | 说明 |
|----------|----------|------|
| 已过期 | `ERROR` | 使用 `Neutralino.os.showNotification` |
| < 24 小时 | `WARNING` | 仅通知一次（通过 notifiedAt 标记） |

---

## 5. 打包和发布流程

### 5.1 Electron 版本打包

**构建工具：** electron-builder 25

**构建配置（package.json > build）：**

```json
{
  "build": {
    "appId": "com.todolist.app",
    "productName": "Todo List",
    "directories": { "output": "dist" },
    "win": {
      "target": [{ "target": "portable", "arch": ["x64"] }],
      "icon": "assets/icons/icon.ico",
      "signAndEditExecutable": false
    },
    "portable": {
      "artifactName": "TodoList.exe"
    },
    "afterPack": "./scripts/after-pack.js"
  }
}
```

**完整构建流程：**

```bash
cd electron-version

# 方式一：直接构建便携版 exe
npm run build
# 产物: dist/TodoList.exe

# 方式二：构建 + 打包发布归档
npm run build:release
# 步骤:
#   1. electron-builder --win --dir → dist/win-unpacked/
#   2. node scripts/package-release.js → release/electron/
#        ├ TodoList-v{version}-win-x64-portable.7z  (LZMA2 极限压缩)
#        └ TodoList-v{version}-win-x64-portable.zip (兼容备选)
```

**发布归档说明：**
- `package-release.js` 优先使用 7-Zip（路径 `C:/Program Files/7-Zip/7z.exe`）进行 LZMA2 极限压缩
- 如果 7-Zip 不可用，回退到 PowerShell `Compress-Archive` 生成 zip
- 两种格式同时生成，方便不同用户解压

### 5.2 Neutralinojs 版本打包

**构建命令：**

```bash
cd neutralino-version

# 构建所有平台
neu build

# 产物: dist/TodoList/
#   ├ TodoList-win_x64.exe    # Windows x64
#   ├ TodoList-linux_x64      # Linux x64
#   ├ TodoList-linux_arm64    # Linux ARM64
#   ├ TodoList-mac_x64        # macOS x64
#   ├ TodoList-mac_arm64      # macOS ARM64
#   ├ TodoList-mac_universal   # macOS Universal
#   └ resources.neu           # 打包的前端资源
```

**Neutralinojs 打包原理：**
- `neu build` 将 `resources/` 目录下的所有文件打包为 `resources.neu`（实质为 zip 格式）
- 将对应平台的 `bin/neutralino-{platform}` 二进制文件复制并重命名为 `TodoList-{platform}`
- 最终产物 = 原生二进制（~3MB）+ resources.neu，极其轻量

### 5.3 发布目录结构

```
release/
├── electron/
│   ├── TodoList-v1.0.0-win-x64-portable.7z     # 7z 压缩包
│   └── TodoList-v1.0.0-win-x64-portable.zip    # zip 压缩包
└── neutralino/
    └── TodoList-Neutralinojs-v1.0.0-win-x64.7z # 7z 压缩包
```

---

## 6. 贡献指南

### 6.1 代码风格

**JavaScript：**
- 使用 Vanilla JavaScript（原生 JS），不引入框架
- 模块化组织：每个功能模块为独立的对象字面量（如 `App`、`Store`、`FilterBar`、`TodoList` 等）
- 使用 `const` / `let`，避免 `var`
- 异步操作使用 `async/await`（Electron 渲染进程 & Neutralinojs 全部采用异步模式）
- 字符串使用单引号 `'`，模板字符串使用反引号 `` ` ``
- 缩进使用 2 个空格
- 函数和模块使用 `// ===== 注释标题 =====` 格式的分隔注释

**CSS：**
- 使用 CSS 变量进行主题管理，所有颜色、间距、阴影均通过变量引用
- 文件按职责拆分：`variables.css`（token）、`base.css`（重置）、`layout.css`（布局）、`components.css`（组件）、`widget.css`（Widget）
- 采用 BEM 风格的类名（如 `.filter-btn`、`.todo-card`、`.tag-manager`）

**文件命名：**
- JavaScript 文件使用 `kebab-case`（如 `todo-list.js`、`filter-bar.js`）
- CSS 文件使用 `kebab-case`
- 变量和函数使用 `camelCase`
- ID 前缀使用 `snake_case`（如 `todo_`、`tag_`）

### 6.2 Git 提交规范

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

**提交消息格式：**

```
<type>(<scope>): <subject>

[可选 body]

[可选 footer]
```

**Type 类型：**

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(widget): 添加快速创建 Todo 功能` |
| `fix` | 修复 Bug | `fix(store): 修复并发写入导致数据丢失` |
| `docs` | 文档更新 | `docs: 更新开发者指南` |
| `style` | 代码格式调整（不影响逻辑） | `style(css): 统一缩进格式` |
| `refactor` | 重构（不新增功能、不修复 Bug） | `refactor(ipc): 提取公共通道注册逻辑` |
| `perf` | 性能优化 | `perf(store): 增加写入防抖间隔` |
| `test` | 测试相关 | `test(store): 添加 CRUD 单元测试` |
| `chore` | 构建、工具链等杂项 | `chore: 升级 electron-builder 到 v25` |
| `build` | 构建系统或外部依赖变更 | `build: 更新打包脚本压缩参数` |

**Scope 范围（可选但推荐）：**

| 范围 | 说明 |
|------|------|
| `electron` | Electron 版本相关 |
| `neutralino` | Neutralinojs 版本相关 |
| `store` | 数据层 |
| `widget` | Widget 组件 |
| `ipc` | IPC 通信 |
| `tray` | 系统托盘 |
| `notification` | 通知系统 |
| `theme` | 主题系统 |
| `filter` | 筛选/排序 |
| `tag` | 标签管理 |
| `build` | 打包/构建 |
| `css` | 样式 |

**提交示例：**

```bash
# 新功能
git commit -m "feat(widget): 支持在 Widget 中编辑 Todo 标题"

# Bug 修复
git commit -m "fix(notification): 修复过期提醒重复发送问题"

# 文档
git commit -m "docs: 添加开发者贡献指南"

# 重构
git commit -m "refactor(store): 将原子写入逻辑提取为独立函数"

# 构建
git commit -m "build(electron): 升级 Electron 到 v33"
```

### 6.3 分支策略

本项目采用 **Git Flow 简化版** 分支模型：

```
main (稳定发布分支)
 │
 ├── develop (开发集成分支)
 │    │
 │    ├── feature/xxx (功能分支)
 │    ├── feature/yyy
 │    └── ...
 │
 ├── fix/xxx (修复分支)
 └── release/vX.Y.Z (发布准备分支)
```

**分支说明：**

| 分支 | 来源 | 合并到 | 说明 |
|------|------|--------|------|
| `main` | - | - | 稳定版本，始终可发布 |
| `develop` | `main` | `main` | 开发集成，功能合并到此 |
| `feature/*` | `develop` | `develop` | 新功能开发 |
| `fix/*` | `develop` 或 `main` | `develop` / `main` | Bug 修复 |
| `release/*` | `develop` | `main` + `develop` | 发布前准备（版本号、文档） |

**开发工作流：**

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/新功能名称

# 2. 开发并提交
git add .
git commit -m "feat(scope): 功能描述"

# 3. 推送并创建 Pull Request
git push origin feature/新功能名称
# 在 GitHub/GitLab 创建 PR，目标分支为 develop

# 4. Code Review 通过后合并
# 合并后删除功能分支
```

**版本号规则（Semantic Versioning）：**

- **MAJOR**（主版本）：不兼容的 API 变更或重大架构调整
- **MINOR**（次版本）：向后兼容的新功能
- **PATCH**（补丁版本）：向后兼容的 Bug 修复

### 6.4 Pull Request 规范

提交 PR 时请确保：

1. **标题** 遵循 Conventional Commits 格式
2. **描述** 包含：
   - 变更内容概述
   - 影响范围（Electron / Neutralinojs / 两者）
   - 测试方法
   - 截图（如涉及 UI 变更）
3. **代码质量**：
   - 无 `console.log` 调试输出残留（`console.error` 和 `console.warn` 可保留）
   - 新增功能在两个版本中保持一致性（如适用）
   - CSS 变量引用正确，亮色/暗色主题均已测试

---

> 如有疑问或建议，请在 Issues 中提出。感谢你对 Todo List 项目的贡献！
