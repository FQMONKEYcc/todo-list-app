# 更新日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [Unreleased]

### 计划中

- 待办事项拖拽排序
- 导入/导出功能
- 多语言支持
- 子任务功能
- 数据云同步

## [1.1.0] - 2026-03-03

### 修复（Fixed）

- 修复主窗口创建/编辑 Todo 模态框无法操作的 Bug（backdrop-filter 动画导致合成层拦截点击事件）
- 修复 cardEnter 动画 fill-mode: both 可能覆盖已完成卡片透明度的问题

### 新增（Added）

- 视图切换功能：支持卡片视图（一排2个）和紧凑视图（一排3-4个）之间自由切换
- 已完成事项自动沉底：无论当前排序方式，已完成事项始终显示在列表底部
- 已完成区域可折叠：点击 "Done (N)" 分隔头可展开/折叠已完成事项
- Widget 浮层已完成分组：Widget 中也支持显示已完成事项（默认折叠）
- 视图模式和折叠状态持久化到用户设置

### 变更（Changed）

- Widget 数据源新增 getWidgetTodos 方法，支持返回包含已完成事项的数据
- 已完成卡片降低透明度至 0.5（Widget）/ 0.65（主窗口）以视觉区分

## [1.0.0] - 2026-03-02

### 新增（Added）

- 待办事项管理（创建、编辑、删除、状态切换：未开始/进行中/已完成）
- 标签系统（创建、编辑、删除、按标签筛选）
- Widget 浮层窗口（快速添加、完成待办、拖拽移动、自动弹出/隐藏）
- 深色/浅色主题切换
- 系统托盘集成（最小化到托盘、右键菜单、双击恢复）
- 截止日期提醒（24 小时内系统通知、逾期红色标记）
- 筛选和排序（按状态/标签/时间范围、按截止日期/创建时间排序）
- 快捷键支持（Ctrl+N 新建、Ctrl+F 搜索、Esc 关闭）
- 关闭行为自定义（最小化/退出/每次询问）
- 双版本实现：Electron 版（~110MB）和 Neutralinojs 版（~3MB）

### 已知问题（Known Issues）

- Neutralinojs 版本 Widget 浮层在任务栏显示独立图标（框架限制）
- Neutralinojs 版本系统通知能力受限

[Unreleased]: https://github.com/FQMONKEYcc/todolist/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/FQMONKEYcc/todolist/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/FQMONKEYcc/todolist/releases/tag/v1.0.0
