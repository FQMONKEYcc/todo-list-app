# Todo List 项目阶段性整理 - 设计文档

**日期：** 2026-03-02
**版本：** 1.0
**状态：** 已批准

---

## 一、概述

### 1.1 背景

Todo List 项目目前包含两种技术实现：
- **Electron 版本**：功能完整，体积较大（~110MB），成熟稳定
- **Neutralinojs 版本**：轻量快速（~3MB），作为实验性替代方案

两个版本的代码当前混杂在项目根目录中，缺乏清晰的组织结构和完整的产品文档。本次整理旨在为项目建立规范的结构、完善的文档体系和标准的发布流程。

### 1.2 目标

1. **结构化**：建立清晰的双版本并列目录结构
2. **文档化**：创建完整的产品文档套件（用户手册、开发指南、功能对比、测试用例）
3. **标准化**：统一发布流程，为两个版本分别打包免安装压缩包
4. **清理化**：移除无用文件，优化项目体积

---

## 二、最终目录结构

```
F:\Claude code\todolist\
│
├── electron-version/              # Electron 实现（~110MB）
│   ├── main/                      # 主进程代码
│   │   ├── main.js                # 入口文件
│   │   ├── ipc-handlers.js        # IPC 通信处理
│   │   ├── store.js               # 数据持久化
│   │   ├── tray.js                # 系统托盘
│   │   └── notifications.js       # 通知管理
│   ├── renderer/                  # 渲染进程代码
│   │   ├── css/                   # 样式文件
│   │   │   ├── base.css
│   │   │   ├── variables.css
│   │   │   ├── layout.css
│   │   │   ├── components.css
│   │   │   └── widget.css
│   │   ├── js/                    # JavaScript 模块
│   │   │   ├── app.js
│   │   │   ├── store.js
│   │   │   ├── todo-form.js
│   │   │   ├── todo-list.js
│   │   │   ├── filter-bar.js
│   │   │   ├── tag-manager.js
│   │   │   ├── theme-toggle.js
│   │   │   ├── widget.js
│   │   │   └── utils.js
│   │   ├── index.html             # 主窗口
│   │   └── widget.html            # Widget 浮层
│   ├── preload/                   # 预加载脚本
│   │   ├── preload.js
│   │   └── widget-preload.js
│   ├── assets/                    # 资源文件
│   │   └── icons/                 # 应用图标
│   ├── dist/                      # 构建产物（保留用于开发）
│   ├── node_modules/              # npm 依赖
│   ├── package.json               # 项目配置
│   ├── package-lock.json
│   └── README.md                  # Electron 版本说明
│
├── neutralino-version/            # Neutralinojs 实现（~3MB）
│   ├── resources/                 # 前端资源
│   │   ├── css/                   # 样式文件（与 Electron 相同结构）
│   │   ├── js/                    # JavaScript 模块
│   │   │   ├── app.js
│   │   │   ├── store.js
│   │   │   ├── widget.js
│   │   │   ├── widget-store.js
│   │   │   ├── theme-toggle.js
│   │   │   └── ...
│   │   ├── icons/                 # 应用图标
│   │   ├── index.html
│   │   └── widget.html
│   ├── bin/                       # Neutralino 二进制文件
│   │   ├── neutralino-win_x64.exe
│   │   ├── neutralino-linux_x64
│   │   └── neutralino-mac_x64
│   ├── dist/                      # 构建产物
│   ├── .tmp/                      # 临时文件（日志、窗口状态）
│   ├── neutralino.config.json     # Neutralino 配置
│   ├── package.json
│   └── README.md                  # Neutralinojs 版本说明
│
├── docs/                          # 统一文档中心
│   ├── USER_MANUAL.md             # 用户手册（中文）
│   ├── DEVELOPER_GUIDE.md         # 开发者指南（中文）
│   ├── FEATURE_COMPARISON.md      # Electron vs Neutralinojs 对比
│   ├── CHANGELOG.md               # 版本更新日志
│   ├── TEST_CASES.md              # 功能测试用例
│   └── plans/                     # 设计文档归档
│       ├── 2026-03-02-widget-quick-add-design.md
│       └── 2026-03-02-project-reorganization-design.md
│
├── release/                       # 统一发布目录
│   ├── electron/
│   │   ├── TodoList-v1.0.0-electron-win-x64.zip
│   │   └── README.txt             # 解压使用说明
│   └── neutralino/
│       ├── TodoList-v1.0.0-neutralino-win-x64.zip
│       └── README.txt             # 解压使用说明
│
├── .gitignore                     # Git 忽略规则
└── README.md                      # 项目总览（中英双语）
```

---

## 三、文档规划

### 3.1 用户手册（USER_MANUAL.md）

**目标读者：** 终端用户

**章节结构：**

#### 1. 快速开始
- 系统要求（Windows 10/11, macOS 10.15+, Ubuntu 20.04+）
- 版本选择指南（Electron vs Neutralinojs）
- 下载和安装步骤
- 首次运行配置

#### 2. 核心功能
- **待办事项管理**
  - 创建待办（标题、描述、截止日期、优先级、标签）
  - 编辑和删除
  - 状态切换（未开始 → 进行中 → 已完成）
  - 批量操作
- **标签系统**
  - 创建和管理标签
  - 为待办分配标签
  - 按标签过滤
- **筛选和排序**
  - 按状态筛选
  - 按标签筛选
  - 按截止日期排序
  - 搜索功能

#### 3. 高级功能
- **Widget 浮层**
  - 显示最近 10 个截止日期
  - 快速添加待办
  - 拖拽移动位置
  - 右键关闭
- **主题切换**
  - 深色模式 / 浅色模式
  - 自动同步到 Widget
- **系统托盘集成**
  - 最小化到托盘
  - 托盘菜单（显示主窗口、显示 Widget、新建待办、退出）
- **快捷键**
  - `Ctrl+N`：新建待办
  - `Ctrl+F`：聚焦搜索
  - `Esc`：关闭弹窗

#### 4. 数据管理
- **数据存储位置**
  - Electron: `C:\Users\[用户名]\AppData\Roaming\TodoList\todos.json`
  - Neutralinojs: `C:\Users\[用户名]\AppData\Roaming\neutralinojs\TodoList\todos.json`
- **数据备份**
  - 手动备份 todos.json 文件
  - 数据格式说明（JSON）
- **数据迁移**
  - Electron ↔ Neutralinojs 数据迁移步骤

#### 5. 故障排除
- **常见问题 FAQ**
  - Q: 关闭窗口后程序消失了？
    A: 程序已最小化到系统托盘，右键托盘图标可恢复
  - Q: Widget 无法拖动？
    A: 按住标题栏（Upcoming Deadlines）区域拖动
  - Q: Neutralinojs 版本的 Widget 在任务栏显示？
    A: 这是框架限制，无法隐藏
- **已知限制**
  - Neutralinojs 的 Widget 会在任务栏显示独立图标
  - 透明窗口效果依赖系统 WebView2 版本

---

### 3.2 开发者指南（DEVELOPER_GUIDE.md）

**目标读者：** 开发者和贡献者

**章节结构：**

#### 1. 技术架构

**Electron 版本架构：**
- **主进程（main/）**
  - Chromium 引擎 + Node.js 环境
  - 负责窗口管理、系统托盘、IPC 通信、数据持久化
  - 关键模块：main.js, ipc-handlers.js, store.js, tray.js
- **渲染进程（renderer/）**
  - HTML/CSS/JavaScript 前端
  - 通过 IPC 与主进程通信
  - 无法直接访问 Node.js API
- **预加载脚本（preload/）**
  - 桥接主进程和渲染进程
  - 暴露安全的 API 到渲染进程（window.api）
- **进程间通信（IPC）**
  - 渲染进程 → 主进程：`ipcRenderer.invoke('channel', data)`
  - 主进程 → 渲染进程：`win.webContents.send('channel', data)`

**Neutralinojs 版本架构：**
- **单进程架构**
  - 使用系统原生 WebView2（Windows）/ WebKit（macOS/Linux）
  - 轻量级的 Neutralino 核心进程
  - 前端通过 `Neutralino.*` API 调用原生功能
- **关键 API**
  - `Neutralino.window.*` - 窗口管理
  - `Neutralino.filesystem.*` - 文件操作
  - `Neutralino.os.*` - 系统调用
  - `Neutralino.events.*` - 事件广播（跨窗口通信）
- **子窗口机制**
  - `Neutralino.window.create()` 创建独立进程
  - 通过 `events.broadcast()` 实现进程间通信
  - Widget 是独立的子进程

#### 2. 项目结构说明

**Electron 版本：**
- `main/` - 主进程代码（Node.js）
- `renderer/` - 前端代码（HTML/CSS/JS）
- `preload/` - 预加载脚本（桥接层）
- `assets/` - 静态资源（图标）
- `dist/` - 打包产物（electron-builder 生成）

**Neutralinojs 版本：**
- `resources/` - 前端资源（HTML/CSS/JS）
- `bin/` - Neutralino 二进制文件
- `dist/` - 打包产物（`neu build` 生成）
- `neutralino.config.json` - 配置文件

#### 3. 开发环境搭建

**前置依赖：**
- Node.js 18+ 和 npm 9+
- Git
- （Neutralinojs）Neutralino CLI: `npm install -g @neutralinojs/neu`

**Electron 版本：**
```bash
cd electron-version/
npm install
npm start           # 开发模式
npm run build       # 打包（Windows/macOS/Linux）
```

**Neutralinojs 版本：**
```bash
cd neutralino-version/
npm install
neu run             # 开发模式
neu build           # 打包
```

#### 4. 核心模块说明

**数据层（Store）**
- **Electron**: `main/store.js` - 使用 `fs` 模块读写 `todos.json`
- **Neutralinojs**: `resources/js/store.js` - 使用 `Neutralino.filesystem` API
- **数据结构**:
  ```json
  {
    "version": 1,
    "todos": [
      {
        "id": "todo_1234567890_abc",
        "title": "完成项目报告",
        "description": "...",
        "status": "未开始",
        "deadline": "2026-03-10T18:00:00.000Z",
        "tagIds": ["tag_123"],
        "createdAt": "...",
        "updatedAt": "...",
        "completedAt": null,
        "notifiedAt": null
      }
    ],
    "tags": [...],
    "settings": {...}
  }
  ```

**Widget 实现原理**
- **Electron**:
  - `BrowserWindow` 创建透明、无边框、置顶窗口
  - `-webkit-app-region: drag` CSS 属性实现拖拽
  - 通过 IPC 与主窗口同步数据
- **Neutralinojs**:
  - `Neutralino.window.create()` 创建子窗口进程
  - JS 实现拖拽（`window.move()` + `requestAnimationFrame` 节流）
  - 通过 `events.broadcast()` 跨进程通信
  - 局限：子窗口会在任务栏显示（框架限制）

**主题系统**
- CSS 变量 + `data-theme` 属性
- 深色/浅色两套配色方案
- 主窗口切换时通过 IPC/events 通知 Widget 同步

**进程间通信**
- **Electron IPC**:
  ```javascript
  // 渲染进程
  const result = await window.api.getTodos();

  // 主进程
  ipcMain.handle('get-todos', () => store.getAllTodos());
  ```
- **Neutralinojs Events**:
  ```javascript
  // 主窗口
  Neutralino.events.broadcast('themeChanged', 'dark');

  // Widget 窗口
  Neutralino.events.on('themeChanged', (e) => {
    applyTheme(e.detail);
  });
  ```

#### 5. 打包和发布

**Electron 打包流程：**
1. 配置 `package.json` 中的 `build` 字段
2. 运行 `npm run build`
3. electron-builder 生成 `dist/` 目录
4. 产物：`TodoList.exe` (Windows) / `.dmg` (macOS) / `.AppImage` (Linux)

**Neutralinojs 打包流程：**
1. 配置 `neutralino.config.json`
2. 运行 `neu build`
3. 产物在 `dist/TodoList/` 目录
4. 手动整合：将 `bin/neutralino-win_x64.exe` 重命名为 `TodoList.exe`，与 `resources/` 一起打包

**发布流程：**
1. 更新 `CHANGELOG.md`
2. 打包两个版本
3. 创建发布压缩包（命名规范：`TodoList-v1.0.0-[electron/neutralino]-win-x64.zip`）
4. 附带 `README.txt` 说明文件
5. 上传到 `release/` 目录

#### 6. 贡献指南

**代码风格：**
- JavaScript: ES6+, 使用 `const/let`, 避免 `var`
- 缩进: 2 空格
- 命名: 小驼峰（camelCase）
- 注释: 关键逻辑必须注释

**Git 提交规范：**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具链

**示例：**
```
feat(widget): 实现拖拽功能

- 添加 JS 拖拽逻辑（Neutralinojs）
- 使用 requestAnimationFrame 节流
- 修复 WebView2 中 -webkit-app-region 不生效的问题

Closes #42
```

---

### 3.3 功能对比表（FEATURE_COMPARISON.md）

| 特性 | Electron 版本 | Neutralinojs 版本 | 说明 |
|------|--------------|------------------|------|
| **体积** | ~110 MB | ~3 MB | Neutralino 使用系统 WebView2 |
| **内存占用** | ~150 MB | ~50 MB | 运行时内存 |
| **启动速度** | 中等（~2s） | 快速（<1s） | |
| **打包工具** | electron-builder | neu build + 手动整合 | |
| **技术栈** | Chromium + Node.js | 系统 WebView2 + Neutralino | |
| **跨平台** | ✅ Windows/macOS/Linux | ✅ Windows/macOS/Linux | |
| **待办管理** | ✅ 完整支持 | ✅ 完整支持 | |
| **标签系统** | ✅ | ✅ | |
| **Widget 浮层** | ✅ 完整支持 | ✅ 支持（有任务栏图标） | |
| **Widget 拖拽** | ✅ 原生 CSS 实现 | ✅ JS 实现 | |
| **Widget 透明** | ✅ 完全透明 | ⚠️ 依赖 WebView2 版本 | |
| **Widget 任务栏** | ❌ 不显示 | ⚠️ 显示独立图标 | 框架限制 |
| **主题切换** | ✅ 实时同步 | ✅ 实时同步 | |
| **系统托盘** | ✅ 完整支持 | ✅ 完整支持 | |
| **截止日期提醒** | ✅ | ✅ | |
| **快捷键** | ✅ | ✅ | |
| **数据持久化** | ✅ todos.json | ✅ todos.json | |
| **自动更新** | ❌ 未实现 | ❌ 未实现 | 未来计划 |
| **开发复杂度** | 中等 | 简单 | Neutralino API 更直观 |
| **调试工具** | ✅ DevTools | ✅ DevTools | |
| **原生模块支持** | ✅ 完整 Node.js 生态 | ❌ 仅支持 Neutralino API | |
| **性能优化** | ✅ V8 引擎优化 | ⚠️ 依赖系统 WebView | |
| **适用场景** | 功能丰富、性能要求高 | 追求轻量、快速启动 | |

**选择建议：**

- **选择 Electron 版本，如果你：**
  - 需要完整的 Node.js 生态支持
  - 追求更好的跨平台一致性
  - 需要复杂的原生功能
  - 不在意安装包体积

- **选择 Neutralinojs 版本，如果你：**
  - 追求极致的轻量化（3MB vs 110MB）
  - 需要快速启动（<1秒）
  - 主要使用基础功能
  - 可以接受 Widget 任务栏图标

---

### 3.4 测试用例（TEST_CASES.md）

**测试环境：** Windows 11 22H2 / macOS 13+ / Ubuntu 22.04

**测试版本：**
- Electron: v1.0.0
- Neutralinojs: v1.0.0

#### 测试用例格式

```markdown
## TC-XXX: [测试标题]

**模块：** [待办管理 / Widget / 主题 / 系统托盘]
**优先级：** [P0-关键 / P1-重要 / P2-次要]
**前置条件：** 应用已启动

**测试步骤：**
1. 步骤 1
2. 步骤 2
3. ...

**预期结果：**
- 结果 1
- 结果 2

**实际结果：** [待填写]
**状态：** [✅ 通过 / ❌ 失败 / ⏸️ 阻塞]
**测试人员：** [姓名]
**测试日期：** [YYYY-MM-DD]
**备注：** [如有异常情况]
```

#### 待办事项管理（TC-001 ~ TC-005）

**TC-001: 创建待办事项**
- **模块：** 待办管理
- **优先级：** P0-关键
- **测试步骤：**
  1. 点击"新建待办"按钮
  2. 输入标题："完成项目报告"
  3. 输入描述："包含需求分析和技术方案"
  4. 设置截止日期：明天 18:00
  5. 选择标签："工作"
  6. 设置优先级："高"
  7. 点击"保存"
- **预期结果：**
  - 待办事项出现在列表顶部
  - 显示正确的标题、日期和标签
  - 状态为"未开始"
  - 优先级标记显示为红色

**TC-002: 编辑待办事项**
- **测试步骤：**
  1. 点击列表中的待办事项
  2. 修改标题为："完成季度项目报告"
  3. 修改截止日期为：后天 15:00
  4. 添加新标签："重要"
  5. 点击"保存"
- **预期结果：**
  - 更改立即生效
  - 列表显示更新后的内容
  - 截止日期倒计时更新

**TC-003: 删除待办事项**
- **测试步骤：**
  1. 点击待办事项的"删除"按钮
  2. 确认删除弹窗中点击"确定"
- **预期结果：**
  - 待办事项从列表中移除
  - 数据文件（todos.json）中对应条目被删除

**TC-004: 切换待办状态**
- **测试步骤：**
  1. 点击待办事项的状态下拉框
  2. 选择"进行中"
- **预期结果：**
  - 状态标签变为蓝色
  - 列表中的排序自动调整（进行中的靠前）

**TC-005: 完成待办事项**
- **测试步骤：**
  1. 点击待办事项的状态下拉框
  2. 选择"已完成"
- **预期结果：**
  - 状态标签变为绿色
  - 添加删除线效果
  - 记录完成时间（`completedAt`）

#### Widget 浮层功能（TC-006 ~ TC-010）

**TC-006: 显示 Widget 浮层**
- **模块：** Widget
- **优先级：** P0-关键
- **测试步骤：**
  1. 右键系统托盘图标
  2. 点击"Show Widget"
- **预期结果：**
  - Widget 窗口在屏幕右下角出现
  - 显示最近 10 个截止日期
  - 按截止时间升序排列
  - 已过期的显示为红色

**TC-007: Widget 拖拽移动**
- **优先级：** P1-重要
- **测试步骤：**
  1. 按住 Widget 标题栏（"Upcoming Deadlines"）
  2. 拖动到屏幕左上角
  3. 释放鼠标
- **预期结果：**
  - Widget 跟随鼠标移动
  - 移动过程流畅无卡顿
  - 释放后停留在新位置

**TC-008: Widget 快速添加待办**
- **优先级：** P0-关键
- **测试步骤：**
  1. 点击 Widget 右上角的"+"按钮
  2. 输入标题："紧急会议"
  3. 设置截止日期：今天 16:00
  4. 点击"Create"
- **预期结果：**
  - 表单展开动画流畅
  - 新待办立即出现在 Widget 列表顶部
  - 主窗口列表同步更新

**TC-009: Widget 右键关闭**
- **优先级：** P1-重要
- **测试步骤：**
  1. 在 Widget 窗口任意位置右键
- **预期结果：**
  - Widget 窗口关闭
  - 主窗口保持打开状态

**TC-010: Widget 主题跟随**
- **优先级：** P1-重要
- **前置条件：** Widget 和主窗口同时打开
- **测试步骤：**
  1. 在主窗口点击主题切换按钮（太阳/月亮图标）
- **预期结果：**
  - Widget 立即切换到对应主题
  - 颜色、背景、文字同步变化
  - 动画过渡自然

#### 主题切换（TC-011 ~ TC-012）

**TC-011: 深色 → 浅色切换**
- **模块：** 主题
- **优先级：** P1-重要
- **前置条件：** 当前为深色主题
- **测试步骤：**
  1. 点击主题切换按钮
- **预期结果：**
  - 背景变为浅色（#F5F5F7）
  - 文字变为深色（#1D1D1F）
  - 图标旋转动画（180度）
  - 设置保存到 todos.json

**TC-012: 浅色 → 深色切换**
- **前置条件：** 当前为浅色主题
- **测试步骤：** 同 TC-011
- **预期结果：**
  - 背景变为深色（#0F0F1A）
  - 文字变为浅色（#E2E8F0）

#### 系统托盘交互（TC-013 ~ TC-016）

**TC-013: 最小化到托盘**
- **模块：** 系统托盘
- **优先级：** P0-关键
- **测试步骤：**
  1. 点击主窗口右上角的"X"关闭按钮
- **预期结果：**
  - 主窗口消失
  - 系统托盘仍显示应用图标
  - Widget 自动弹出（如果设置启用）

**TC-014: 从托盘恢复主窗口**
- **优先级：** P0-关键
- **测试步骤：**
  1. 右键托盘图标
  2. 点击"Show Todo List"
- **预期结果：**
  - 主窗口恢复显示
  - 窗口位置和大小与关闭前一致
  - 窗口获得焦点（置顶）

**TC-015: 托盘快速新建**
- **优先级：** P1-重要
- **测试步骤：**
  1. 右键托盘图标
  2. 点击"New Todo"
- **预期结果：**
  - 主窗口恢复
  - 自动打开新建待办表单
  - 标题输入框自动聚焦

**TC-016: 托盘退出应用**
- **优先级：** P0-关键
- **测试步骤：**
  1. 右键托盘图标
  2. 点击"Quit"
- **预期结果：**
  - 主窗口关闭
  - Widget 关闭
  - 托盘图标消失
  - 进程完全退出（任务管理器中无残留）

#### 截止日期提醒（TC-017 ~ TC-018）

**TC-017: 24 小时内提醒**
- **模块：** 通知
- **优先级：** P1-重要
- **前置条件：**
  - 存在截止时间在未来 24 小时内的待办
  - 该待办尚未发送过通知（`notifiedAt` 为 null）
- **测试步骤：**
  1. 等待 60 秒（通知检查间隔）
- **预期结果：**
  - 系统通知弹出
  - 通知标题："Deadline Approaching"
  - 通知内容：`"[待办标题]" is due in X hour(s)!`
  - 待办的 `notifiedAt` 字段被记录

**TC-018: 逾期提醒**
- **前置条件：** 存在已逾期且未发送提醒的待办
- **测试步骤：** 等待 60 秒
- **预期结果：**
  - 系统通知弹出
  - 通知标题："Deadline Overdue"
  - 通知内容：`"[待办标题]" is past due!`
  - 通知类型为 ERROR（红色）

#### 标签管理（TC-019 ~ TC-021）

**TC-019: 创建标签**
- **模块：** 标签管理
- **优先级：** P1-重要
- **测试步骤：**
  1. 点击"管理标签"按钮
  2. 输入标签名称："紧急"
  3. 选择颜色：红色（#EF4444）
  4. 点击"添加"
- **预期结果：**
  - 标签出现在标签列表
  - 过滤栏显示新标签
  - 新建待办时可选择该标签

**TC-020: 按标签过滤**
- **优先级：** P1-重要
- **测试步骤：**
  1. 在过滤栏点击标签"工作"
- **预期结果：**
  - 列表仅显示带有"工作"标签的待办
  - 标签按钮高亮显示
  - 计数器显示匹配数量

**TC-021: 删除标签**
- **优先级：** P2-次要
- **测试步骤：**
  1. 打开"管理标签"
  2. 点击标签"紧急"的删除按钮
  3. 确认删除
- **预期结果：**
  - 标签从列表中移除
  - 已分配该标签的待办清空该标签
  - 过滤栏不再显示该标签

---

### 3.5 更新日志（CHANGELOG.md）

**格式规范：** 遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)

```markdown
# 更新日志

本项目的所有显著变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划新增
- 自动更新功能
- 数据导出（CSV/PDF）
- 多语言支持（英文、日文）

---

## [1.0.0] - 2026-03-02

### 新增
- ✨ 待办事项管理（创建、编辑、删除、状态切换）
- 🏷️ 标签系统（创建、分配、过滤）
- 📅 截止日期和提醒（24 小时内、逾期）
- 🎨 深色/浅色主题切换
- 🪟 Widget 浮层（快速添加、拖拽、实时同步）
- 🔔 系统托盘集成（最小化、恢复、快捷新建）
- ⌨️ 快捷键支持（Ctrl+N, Ctrl+F, Esc）
- 💾 数据持久化（JSON 文件）

### 技术实现
- 📦 Electron 版本（v28, ~110MB）
- ⚡ Neutralinojs 版本（v6.5, ~3MB）
- 🎯 双版本功能一致性

### 已知问题
- ⚠️ Neutralinojs 的 Widget 会在任务栏显示独立图标（框架限制）
- ⚠️ 透明窗口效果依赖系统 WebView2 版本

---

## [0.5.0] - 2026-02-27

### 新增
- 初始版本开发
- Bento Grid UI 设计系统
- 基础待办 CRUD 功能

### 变更
- 从 Vanilla JS 迁移到模块化架构
```

---

## 四、发布打包方案

### 4.1 Electron 版本打包

**目录结构：**
```
TodoList-v1.0.0-electron-win-x64/
├── TodoList.exe                   # 主程序（74MB）
├── resources/                     # Electron 资源（ASAR 打包）
├── locales/                       # 语言文件
├── LICENSE.electron.txt           # Electron 许可证
├── README.txt                     # 使用说明（中文）
└── LICENSES.chromium.html         # Chromium 许可证
```

**README.txt 内容：**
```
========================================
  Todo List - Electron 版本 v1.0.0
========================================

【运行方式】
双击 TodoList.exe 即可启动。

【系统要求】
- Windows 10/11 (64位)
- 内存：建议 4GB 以上

【数据存储位置】
C:\Users\[您的用户名]\AppData\Roaming\TodoList\todos.json

【首次运行】
1. 应用启动后会自动最小化到系统托盘（任务栏右下角通知区域）
2. 右键托盘图标可以显示/隐藏主窗口
3. 关闭主窗口后会弹出 Widget 浮层（可选）

【功能亮点】
✓ 待办事项管理（创建、编辑、删除、状态切换）
✓ Widget 浮层快速添加（无任务栏图标）
✓ 深色/浅色主题切换（实时同步）
✓ 截止日期提醒（24 小时内、逾期）
✓ 标签系统（创建、过滤）
✓ 快捷键（Ctrl+N 新建、Ctrl+F 搜索、Esc 关闭）

【常见问题】
Q: 关闭窗口后程序消失了？
A: 程序已最小化到系统托盘，右键托盘图标可恢复。

Q: 如何备份数据？
A: 复制上述"数据存储位置"的 todos.json 文件即可。

【详细文档】
请访问项目文档：
https://github.com/[your-repo]/todolist/docs

【问题反馈】
Email: [your-email]@example.com
GitHub Issues: https://github.com/[your-repo]/todolist/issues

【版权声明】
© 2026 [Your Name]. All rights reserved.
本软件基于 MIT 许可证发布。
```

**打包命令：**
```bash
cd electron-version/
npm run build
cd dist/
# 手动创建 README.txt
7z a -t7z TodoList-v1.0.0-electron-win-x64.7z win-unpacked/
zip -r TodoList-v1.0.0-electron-win-x64.zip win-unpacked/
```

---

### 4.2 Neutralinojs 版本打包

**目录结构：**
```
TodoList-v1.0.0-neutralino-win-x64/
├── TodoList.exe                   # 重命名的 neutralino-win_x64.exe (2.6MB)
├── resources/                     # 完整的前端资源
│   ├── css/
│   │   ├── base.css
│   │   ├── variables.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── widget.css
│   ├── js/
│   │   ├── app.js
│   │   ├── neutralino.js
│   │   ├── store.js
│   │   ├── widget.js
│   │   ├── widget-store.js
│   │   ├── theme-toggle.js
│   │   └── ...
│   ├── icons/
│   │   ├── appIcon.png
│   │   └── trayIcon.png
│   ├── index.html
│   └── widget.html
├── neutralino.config.json         # 配置文件
└── README.txt                     # 使用说明（中文）
```

**README.txt 内容：**
```
==========================================
  Todo List - Neutralinojs 版本 v1.0.0
==========================================

【运行方式】
双击 TodoList.exe 即可启动。

【系统要求】
- Windows 10/11 (64位)
- WebView2 Runtime（首次运行自动检测并提示安装）
- 内存：建议 2GB 以上

【版本特点】
✓ 超小体积（仅 ~3MB，而 Electron 版本为 110MB）
✓ 快速启动（<1秒）
✓ 低内存占用（~50MB，而 Electron 版本为 150MB）

【数据存储位置】
C:\Users\[您的用户名]\AppData\Roaming\neutralinojs\TodoList\todos.json

【首次运行】
1. 如果系统未安装 WebView2 Runtime，会提示下载安装
2. 安装后重新启动 TodoList.exe
3. 应用启动后自动最小化到系统托盘

【已知限制】
⚠️ Widget 浮层会在任务栏显示独立图标（框架限制，标题为单个空格）
⚠️ 透明窗口效果可能受系统 WebView2 版本影响

【功能说明】
除上述限制外，其他功能与 Electron 版本完全一致：
✓ 待办事项管理
✓ Widget 浮层快速添加（支持拖拽，按住标题栏移动）
✓ 深色/浅色主题切换
✓ 截止日期提醒
✓ 标签系统
✓ 快捷键支持

【数据迁移】
如果你从 Electron 版本迁移：
1. 复制 Electron 版本的 todos.json 文件
2. 粘贴到上述"数据存储位置"
3. 重启 TodoList 即可

【常见问题】
Q: 提示缺少 WebView2 Runtime？
A: 访问 https://go.microsoft.com/fwlink/p/?LinkId=2124703 下载安装。

Q: Widget 为什么会在任务栏显示？
A: 这是 Neutralinojs 框架的限制，无法隐藏子窗口的任务栏图标。

Q: Widget 如何拖动？
A: 按住标题栏（"Upcoming Deadlines"）区域拖动。

【详细文档】
https://github.com/[your-repo]/todolist/docs

【问题反馈】
Email: [your-email]@example.com
GitHub Issues: https://github.com/[your-repo]/todolist/issues

【版权声明】
© 2026 [Your Name]. All rights reserved.
本软件基于 MIT 许可证发布。
```

**打包步骤：**
```bash
cd neutralino-version/
neu build

# 创建发布目录
mkdir -p ../../release/neutralino/TodoList-v1.0.0-neutralino-win-x64

# 复制文件
cp bin/neutralino-win_x64.exe ../../release/neutralino/TodoList-v1.0.0-neutralino-win-x64/TodoList.exe
cp -r resources/ ../../release/neutralino/TodoList-v1.0.0-neutralino-win-x64/
cp neutralino.config.json ../../release/neutralino/TodoList-v1.0.0-neutralino-win-x64/

# 创建 README.txt（内容如上）
# ...

# 打包
cd ../../release/neutralino/
7z a -t7z TodoList-v1.0.0-neutralino-win-x64.7z TodoList-v1.0.0-neutralino-win-x64/
zip -r TodoList-v1.0.0-neutralino-win-x64.zip TodoList-v1.0.0-neutralino-win-x64/
```

---

## 五、文件清理策略

### 5.1 需要删除的文件

**根目录级别：**
- `dist/` - 移动到 `electron-version/dist/` 后删除
- `release/*.zip` 和 `release/*.7z` - 移动到 `release/electron/` 后删除
- `todolist-neu/` - 整体移动到 `neutralino-version/` 后删除原目录

**Electron 版本：**
- `dist/builder-debug.yml` - 构建调试文件
- `dist/builder-effective-config.yaml` - 临时配置
- `dist/*.blockmap` - 增量更新映射（未启用）

**Neutralinojs 版本：**
- `.tmp/logs/*.log` - 运行时日志（但保留 `.tmp/` 目录结构）
- `.tmp/window_state.config.json` - 窗口状态缓存

**通用清理：**
- `.DS_Store` (macOS)
- `Thumbs.db` (Windows)
- `*.swp`, `*.swo` (Vim)
- `.vscode/` 用户配置（保留 `.vscode/settings.json` 模板）

### 5.2 更新 .gitignore

```gitignore
# 操作系统
.DS_Store
Thumbs.db

# 编辑器
.vscode/
.idea/
*.swp
*.swo

# 依赖
node_modules/

# 构建产物
electron-version/dist/
neutralino-version/dist/
neutralino-version/.tmp/logs/
neutralino-version/.tmp/window_state.config.json

# 发布包（本地构建）
release/*.zip
release/*.7z
release/*/*.zip
release/*/*.7z

# 日志
*.log
npm-debug.log*

# 环境变量
.env
.env.local
```

---

## 六、Git 操作流程

### 6.1 文件移动（保留历史）

```bash
cd "F:\Claude code\todolist"

# 1. 创建新目录结构
mkdir electron-version neutralino-version
mkdir -p release/electron release/neutralino

# 2. 移动 Electron 文件（使用 git mv 保留历史）
git mv main renderer preload assets electron-version/
git mv package.json package-lock.json electron-version/
# dist/ 目录已存在，需要先清理再移动
git mv dist electron-version/

# 3. 移动 Neutralinojs 文件
git mv todolist-neu/* neutralino-version/
rmdir todolist-neu

# 4. 移动 release 文件
git mv release/*.zip release/*.7z release/electron/

# 5. 提交第一阶段（目录重组）
git add .
git commit -m "重构: 将 Electron 和 Neutralinojs 分离到独立目录

- 创建 electron-version/ 和 neutralino-version/ 目录
- 移动所有源码到对应目录
- 统一 release/ 发布结构
- 保留完整 Git 历史

BREAKING CHANGE: 项目目录结构发生重大变更"

# 6. 清理无用文件
rm -rf electron-version/dist/builder-debug.yml
rm -rf neutralino-version/.tmp/logs/*.log
# ... 其他清理

# 7. 更新 .gitignore
# （手动编辑）

# 8. 提交第二阶段（清理）
git add .
git commit -m "chore: 清理无用文件和更新 .gitignore

- 删除构建调试文件
- 清理临时日志
- 更新 Git 忽略规则"
```

### 6.2 文档提交

```bash
# 9. 创建文档（分批提交）
git add docs/USER_MANUAL.md
git commit -m "docs: 添加用户手册"

git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: 添加开发者指南"

git add docs/FEATURE_COMPARISON.md
git commit -m "docs: 添加功能对比表"

git add docs/TEST_CASES.md
git commit -m "docs: 添加测试用例"

git add docs/CHANGELOG.md
git commit -m "docs: 添加更新日志"

git add docs/plans/2026-03-02-project-reorganization-design.md
git commit -m "docs: 添加项目整理设计文档"

# 10. 更新根目录 README
git add README.md
git commit -m "docs: 更新项目总览 README"
```

### 6.3 发布提交

```bash
# 11. 打包并提交 release
# （完成打包后）
git add release/electron/*.zip release/electron/*.7z release/electron/README.txt
git commit -m "release: Electron v1.0.0 发布包

- 打包 Windows x64 版本
- 添加使用说明文档
- 体积: ~110MB"

git add release/neutralino/*.zip release/neutralino/*.7z release/neutralino/README.txt
git commit -m "release: Neutralinojs v1.0.0 发布包

- 打包 Windows x64 版本
- 添加使用说明文档
- 体积: ~3MB"

# 12. 创建版本标签
git tag -a v1.0.0 -m "Todo List v1.0.0

新功能:
- 待办事项管理（CRUD、状态切换）
- Widget 浮层（快速添加、拖拽、主题同步）
- 深色/浅色主题切换
- 系统托盘集成
- 截止日期提醒
- 标签系统

技术实现:
- Electron 版本（~110MB）
- Neutralinojs 版本（~3MB）

详细文档: docs/"

git push origin main --tags
```

---

## 七、后续维护建议

### 7.1 版本号规范

**语义化版本 (Semver)：** `MAJOR.MINOR.PATCH`

- **MAJOR（主版本号）**：不兼容的 API 变更（如数据格式变化）
- **MINOR（次版本号）**：向后兼容的功能新增（如新增导出功能）
- **PATCH（修订号）**：向后兼容的 Bug 修复

**示例：**
- `1.0.0` → 首个正式版本
- `1.0.1` → 修复 Widget 拖拽卡顿
- `1.1.0` → 新增数据导出功能
- `2.0.0` → 数据格式升级为 SQLite

### 7.2 发布流程

1. 更新 `CHANGELOG.md`
2. 更新 `package.json` 版本号
3. 运行完整测试用例
4. 打包两个版本
5. 创建 Git 标签
6. 发布到 GitHub Releases

### 7.3 问题跟踪

**GitHub Issues 标签分类：**
- `bug` - Bug 报告
- `feature` - 功能请求
- `enhancement` - 改进建议
- `documentation` - 文档相关
- `electron` - Electron 版本专属
- `neutralino` - Neutralinojs 版本专属
- `good first issue` - 适合新手
- `help wanted` - 需要帮助

---

## 八、成功标准

**项目整理完成的标志：**

1. ✅ 目录结构清晰：双版本独立存放，文档和发布物统一管理
2. ✅ 文档完整：5 份核心文档齐全（用户手册、开发指南、功能对比、测试用例、更新日志）
3. ✅ 测试用例覆盖：21 个核心功能测试点
4. ✅ 发布包标准化：
   - Electron: `TodoList-v1.0.0-electron-win-x64.zip` (带 README.txt)
   - Neutralinojs: `TodoList-v1.0.0-neutralino-win-x64.zip` (带 README.txt)
5. ✅ 无用文件清理：临时文件、构建缓存、日志等全部移除
6. ✅ Git 历史完整：使用 `git mv` 保留文件变更历史
7. ✅ README 更新：根目录 README.md 提供项目总览和快速导航

---

## 九、时间估算

**总计：约 6-8 小时**

| 任务 | 预计时间 |
|------|----------|
| 目录结构重组 | 1 小时 |
| 编写用户手册 | 1.5 小时 |
| 编写开发者指南 | 1.5 小时 |
| 编写功能对比表 | 0.5 小时 |
| 编写测试用例 | 1 小时 |
| 打包和发布 | 1 小时 |
| 清理和 Git 提交 | 0.5 小时 |
| 测试验证 | 1 小时 |

---

**设计文档版本历史：**
- v1.0 (2026-03-02): 初始版本，已批准
