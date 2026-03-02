# Todo List - Electron 版本

**版本：** v1.0.0
**技术栈：** Electron 33 + Chromium + Node.js
**体积：** ~110 MB

## 快速开始

### 系统要求

- Windows 10 或更高版本（64位）
- 无需安装 .NET 或其他运行时

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发模式
npm start
```

### 打包发布

```bash
# 构建免安装便携版
npm run build

# 构建并打包到 release 目录
npm run build:release
```

生成的可执行文件在 `dist/` 目录。

## 目录结构

```
electron-version/
├── main/               # 主进程代码（Node.js）
│   ├── main.js         # 应用入口、窗口管理、Widget
│   ├── store.js        # 数据持久化（JSON 文件）
│   ├── tray.js         # 系统托盘
│   ├── notifications.js # 截止日期提醒
│   └── ipc-handlers.js # IPC 通道注册
├── renderer/           # 渲染进程代码（HTML/CSS/JS）
│   ├── index.html      # 主界面
│   ├── widget.html     # Widget 浮层界面
│   ├── css/            # 样式文件（模块化）
│   └── js/             # 前端逻辑（模块化）
├── preload/            # 预加载脚本（IPC 桥接）
│   ├── preload.js      # 主窗口预加载
│   └── widget-preload.js # Widget 预加载
├── assets/             # 静态资源（图标）
├── scripts/            # 构建脚本
├── dist/               # 构建产物
└── package.json        # 项目配置
```

## 主要特性

- ✅ 完整的 Node.js 生态支持
- ✅ 原生 IPC 进程间通信
- ✅ Widget 浮层（无任务栏图标，skipTaskbar）
- ✅ 系统托盘深度集成
- ✅ 原生系统通知
- ✅ 跨平台一致性

## 数据存储

数据文件位于 Electron userData 目录：
- Windows: `%APPDATA%/todolist/todos.json`

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+N` | 新建待办 |
| `Ctrl+F` | 搜索/筛选 |
| `Esc` | 关闭弹窗 |

## 详细文档

请参阅项目根目录的 `docs/` 文件夹：
- [用户手册](../docs/USER_MANUAL.md)
- [开发者指南](../docs/DEVELOPER_GUIDE.md)
- [功能对比](../docs/FEATURE_COMPARISON.md)
- [测试用例](../docs/TEST_CASES.md)
- [更新日志](../docs/CHANGELOG.md)

## 许可证

MIT License © 2026
