# Todo List

> **本项目由 [FQMONKEY](https://github.com/FQMONKEYcc) 牵引，完全由 [Claude Code](https://claude.ai/code) 开发。**

一个现代化的待办事项管理桌面应用，提供 **Electron** 和 **Neutralinojs** 两种实现版本。

**版本：** v1.1.0
**最后更新：** 2026-03-03

---

## 最新更新 — v1.1.0 (2026-03-03)

### 🐛 Bug 修复

- **修复模态框无法操作**：解决了在主界面点击创建日程后，弹窗中无法进行输入、选择日期等任何操作的严重 Bug（根因：`backdrop-filter` 动画在 Chromium 中创建合成层拦截点击事件）
- **修复卡片透明度异常**：修正了入场动画 `fill-mode` 覆盖已完成卡片透明度的问题

### ✨ 新功能

- **视图切换**：toolbar 新增视图切换按钮，支持卡片视图（一排 2 个大卡片）和紧凑视图（一排 3-4 个小卡片）两种显示模式，偏好自动持久化
- **已完成事项沉底**：已完成的事项自动排列到列表底部，不受当前排序方式影响
- **可折叠的已完成区域**：底部 "Done (N)" 分隔头可点击折叠/展开已完成事项
- **Widget 浮层支持**：Widget 浮层同样支持已完成事项分组显示（默认折叠）

> 两个版本（Electron + Neutralinojs）同步更新 | 完整更新历史请查看 [CHANGELOG](./docs/CHANGELOG.md)

---

## 版本选择

### Electron 版本

**适合：** 需要丰富功能和完整 Node.js 生态
**体积：** ~110 MB | **内存：** ~150 MB | **启动：** ~2 秒

[electron-version/](./electron-version/)

### Neutralinojs 版本

**适合：** 追求极致轻量和快速启动
**体积：** ~3 MB | **内存：** ~50 MB | **启动：** < 1 秒

[neutralino-version/](./neutralino-version/)

详细对比请查看：[功能对比表](./docs/FEATURE_COMPARISON.md)

---

## 主要功能

- **待办事项管理** — 创建、编辑、删除、状态切换（未开始 / 进行中 / 已完成）
- **标签系统** — 创建自定义标签、按标签筛选
- **Widget 浮层** — 桌面悬浮窗，快速添加待办、查看即将到期事项
- **主题切换** — 深色 / 浅色模式自由切换
- **系统托盘** — 最小化到托盘、右键快捷菜单
- **截止日期提醒** — 24 小时内到期系统通知、逾期红色标记
- **筛选排序** — 按状态 / 标签 / 时间范围筛选，按截止日期 / 创建时间排序
- **视图切换** — 卡片视图 / 紧凑视图自由切换
- **已完成沉底** — 已完成事项自动沉底，支持折叠/展开
- **快捷键** — Ctrl+N 新建、Ctrl+F 搜索、Esc 关闭弹窗

---

## 快速开始

### Electron 版本

```bash
cd electron-version
npm install
npm start
```

### Neutralinojs 版本

```bash
# 首先安装 Neutralino CLI
npm install -g @neutralinojs/neu

cd neutralino-version
neu run
```

---

## 文档

| 文档 | 说明 |
|------|------|
| [用户手册](./docs/USER_MANUAL.md) | 功能介绍和使用指南 |
| [开发者指南](./docs/DEVELOPER_GUIDE.md) | 架构说明和贡献指南 |
| [功能对比](./docs/FEATURE_COMPARISON.md) | Electron vs Neutralinojs 详细对比 |
| [测试用例](./docs/TEST_CASES.md) | 21 个核心功能测试点 |
| [更新日志](./docs/CHANGELOG.md) | 版本历史记录 |

---

## 发布包

预构建的免安装版本：

| 版本 | 位置 | 体积 |
|------|------|------|
| Electron | [release/electron/](./release/electron/) | ~63 MB (7z) |
| Neutralinojs | [release/neutralino/](./release/neutralino/) | ~2.5 MB (7z) |

---

## 技术栈

| 特性 | Electron 版本 | Neutralinojs 版本 |
|------|--------------|------------------|
| 引擎 | Chromium + Node.js | 系统 WebView2 |
| 框架版本 | Electron 33 | Neutralinojs 6.5 |
| 前端 | HTML / CSS / JavaScript | HTML / CSS / JavaScript |
| 数据存储 | JSON 文件 (userData) | Neutralino.storage |
| 打包工具 | electron-builder | neu build |
| 打包格式 | Portable EXE | 独立目录 + EXE |

---

## 项目结构

```
todolist/
├── electron-version/       # Electron 实现 (~110MB)
│   ├── main/               # 主进程
│   ├── renderer/           # 渲染进程
│   ├── preload/            # 预加载脚本
│   └── assets/             # 静态资源
├── neutralino-version/     # Neutralinojs 实现 (~3MB)
│   ├── resources/          # 前端资源
│   ├── bin/                # 二进制文件
│   └── neutralino.config.json
├── docs/                   # 统一文档中心
│   ├── USER_MANUAL.md
│   ├── DEVELOPER_GUIDE.md
│   ├── FEATURE_COMPARISON.md
│   ├── TEST_CASES.md
│   ├── CHANGELOG.md
│   └── plans/              # 设计文档归档
├── release/                # 发布包目录
│   ├── electron/
│   └── neutralino/
└── README.md               # 本文件
```

---

## 许可证

MIT License © 2026

---

## 快速链接

- [Electron 版本 README](./electron-version/README.md)
- [Neutralinojs 版本 README](./neutralino-version/README.md)
- [设计文档归档](./docs/plans/)
