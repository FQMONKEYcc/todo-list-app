# Todo List - Neutralinojs 版本

**版本：** v1.0.0
**技术栈：** Neutralinojs 6.5 + 系统 WebView2
**体积：** ~3 MB

## 快速开始

### 系统要求

- Windows 10 或更高版本（64位）
- 系统自带 WebView2 运行时（Win10/11 默认已安装）

### 前置依赖

安装 Neutralino CLI：
```bash
npm install -g @neutralinojs/neu
```

### 开发模式

```bash
# 启动开发模式（热重载）
neu run
```

### 打包发布

```bash
# 构建发布版本
neu build
```

生成的文件在 `dist/TodoList/` 目录。

## 目录结构

```
neutralino-version/
├── resources/              # 前端资源
│   ├── index.html          # 主界面
│   ├── widget.html         # Widget 浮层界面
│   ├── css/                # 样式文件（模块化）
│   │   ├── base.css        # 基础样式
│   │   ├── variables.css   # CSS 变量（主题）
│   │   ├── components.css  # 组件样式
│   │   ├── layout.css      # 布局样式
│   │   └── widget.css      # Widget 样式
│   ├── js/                 # 前端逻辑（模块化）
│   │   ├── main.js         # 应用入口
│   │   ├── app.js          # 核心逻辑
│   │   ├── store.js        # 数据持久化
│   │   ├── widget.js       # Widget 逻辑
│   │   ├── widget-store.js # Widget 数据桥接
│   │   ├── filter-bar.js   # 筛选栏
│   │   ├── tag-manager.js  # 标签管理
│   │   ├── theme-toggle.js # 主题切换
│   │   ├── todo-form.js    # 待办表单
│   │   ├── todo-list.js    # 待办列表渲染
│   │   └── utils.js        # 工具函数
│   └── icons/              # 图标资源
├── bin/                    # Neutralino 二进制文件
├── dist/                   # 构建产物
├── docs/                   # 版本专属文档
├── .github/                # GitHub 配置
├── neutralino.config.json  # Neutralino 配置
└── LICENSE                 # 许可证
```

## 主要特性

- ✅ 超轻量体积（3 MB vs 110 MB）
- ✅ 极速启动（< 1 秒）
- ✅ 低内存占用（~50 MB）
- ✅ 使用系统原生 WebView2 渲染
- ✅ 完整的待办管理功能
- ⚠️ Widget 在任务栏显示独立图标（框架限制）
- ⚠️ 系统通知能力受限（依赖 OS API）

## 数据存储

数据使用 Neutralino.storage API 存储：
- 存储在应用目录下的 `.storage/` 文件夹
- 支持键值对存储

## 与 Electron 版本的主要差异

| 特性 | Electron | Neutralinojs |
|------|----------|-------------|
| 体积 | ~110 MB | ~3 MB |
| 内存 | ~150 MB | ~50 MB |
| Widget 任务栏图标 | 隐藏 ✅ | 显示 ⚠️ |
| 系统通知 | 原生支持 ✅ | 受限 ⚠️ |
| 进程隔离 | 有 ✅ | 无 ⚠️ |

详细对比请查看：[功能对比表](../docs/FEATURE_COMPARISON.md)

## 详细文档

请参阅项目根目录的 `docs/` 文件夹：
- [用户手册](../docs/USER_MANUAL.md)
- [开发者指南](../docs/DEVELOPER_GUIDE.md)
- [功能对比](../docs/FEATURE_COMPARISON.md)
- [测试用例](../docs/TEST_CASES.md)
- [更新日志](../docs/CHANGELOG.md)

## 许可证

MIT License © 2026
