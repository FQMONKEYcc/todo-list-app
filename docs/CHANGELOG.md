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

[Unreleased]: https://github.com/your-username/todolist/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/todolist/releases/tag/v1.0.0
