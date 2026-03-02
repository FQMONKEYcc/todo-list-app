# Todo List UI/UX 全面优化方案 — Bento Grid 风格

## 🎯 目标

将现有 Todo List 从传统列表式布局全面升级为 **Bento Grid 现代风格**，同时优化配色、动画、交互反馈和整体体验。

---

## 📐 设计系统

### 配色方案（重新设计）

**Light Mode — 温暖现代**
| 变量 | 旧值 | 新值 | 说明 |
|------|------|------|------|
| `--bg` | `#f0f2f5` | `#F5F5F7` | Apple 风格柔灰背景 |
| `--bg-sidebar` | `#ffffff` | `#FFFFFF` | 保持纯白 |
| `--bg-card` | `#ffffff` | `#FFFFFF` | 卡片白色 |
| `--bg-card-hover` | `#f8f9fa` | `#F0F0F3` | 更明显的悬停 |
| `--bg-input` | `#f5f6f8` | `#F0F0F3` | 输入框背景 |
| `--primary` | `#4a6274` (暗灰蓝) | `#6366F1` (Indigo) | 更鲜明的主色 |
| `--primary-hover` | `#3d5263` | `#4F46E5` | 主色悬停 |
| `--accent` | `#5d7a8f` | `#8B5CF6` (Violet) | 点缀色 |
| `--shadow` | `rgba(0,0,0,0.08)` | `rgba(99,102,241,0.08)` | 带品牌色的阴影 |
| `--shadow-lg` | `rgba(0,0,0,0.12)` | `rgba(99,102,241,0.15)` | 大阴影 |

**Dark Mode — Tokyo Night 增强**
| 变量 | 旧值 | 新值 | 说明 |
|------|------|------|------|
| `--bg` | `#1a1b26` | `#0F0F1A` | 更深的背景 |
| `--bg-sidebar` | `#1f2030` | `#161625` | 侧边栏 |
| `--bg-card` | `#24283b` | `#1C1C2E` | 卡片背景 |
| `--bg-card-hover` | `#2f3347` | `#252540` | 卡片悬停 |
| `--primary` | `#7aa2f7` | `#818CF8` (Indigo 400) | 主色 |
| `--primary-hover` | `#5d8ce6` | `#6366F1` | 主色悬停 |
| `--accent` | `#89b4fa` | `#A78BFA` (Violet 400) | 点缀色 |

新增变量：
- `--card-radius: 20px` — Bento 卡片圆角
- `--grid-gap: 16px` — 网格间距
- `--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)` — 快速过渡
- `--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1)` — 标准过渡
- `--transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1)` — 弹性过渡
- `--gradient-primary: linear-gradient(135deg, var(--primary), var(--accent))` — 渐变

### 字体

由系统字体 → **Inter**（Google Fonts 加载太慢不适合 Electron，改为本地 system-ui 优化栈）

```css
font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

> 由于 CSP 限制（`style-src 'self' 'unsafe-inline'`），不能引入外部 Google Fonts。改为优化系统字体栈，提升层次感通过字重和间距实现。

---

## 📦 改造内容

### Phase 1: 主题系统 + 配色升级（variables.css）

1. 更新所有 CSS 变量值（Light/Dark）
2. 新增设计 token：`--card-radius`, `--grid-gap`, `--transition-*`, `--gradient-*`
3. 新增 `prefers-reduced-motion` 媒体查询支持

**修改文件：** `renderer/css/variables.css`

### Phase 2: 基础样式优化（base.css）

1. 优化字体栈，增加字重层次
2. 改进滚动条样式（更细、更圆润）
3. 添加全局过渡变量
4. 添加 `::selection` 选中样式
5. 添加 `prefers-reduced-motion` 全局减弱动画

**修改文件：** `renderer/css/base.css`

### Phase 3: Bento Grid 布局改造（layout.css）

**侧边栏改造：**
- 增加内部间距和圆角分组
- 侧边栏内容改为卡片分区式排列
- 新建按钮改为渐变背景 + 更大的圆角

**主内容区改造：**
- Todo 列表区域改为 **CSS Grid** 布局
- 卡片大小：统一使用 Bento 风格的等高卡片
- 工具栏：搜索框增加圆角和柔和阴影
- 空状态：添加渐变图标 + 更精致的提示

**修改文件：** `renderer/css/layout.css`

### Phase 4: 组件全面升级（components.css）

**按钮系统：**
- `.btn-primary` → 渐变背景 + 悬停时 `translateY(-1px)` + 阴影扩展
- `.btn-new-todo` → 渐变背景 + 图标旋转 hover 动画
- 所有按钮添加 `active` 按下反馈（scale 0.97）
- 所有交互元素确保 `cursor: pointer`

**Todo 卡片（核心改造）：**
- 改为 Bento Grid 卡片风格：`border-radius: 20px`
- 去掉硬边框，改用柔和阴影 `box-shadow`
- 悬停效果：`translateY(-2px)` + 阴影扩展 + 左侧状态色边条
- 状态按钮增加过渡动画（打勾时有弹跳效果）
- 操作按钮（编辑/删除）改为从右侧滑入而非瞬间出现
- 标签 chip 增加微妙的背景渐变
- 完成状态的卡片：降低不透明度 + 柔和划线

**日期筛选标签页：**
- 活跃态添加底部指示条动画
- 切换时有平滑的背景移动效果

**状态筛选按钮：**
- 状态圆点增加发光效果（"进行中"有脉动动画）
- 激活态添加左侧色条指示

**模态框：**
- 增大圆角到 24px
- 增加背景毛玻璃效果 `backdrop-filter: blur(20px)`
- 打开动画改为 scale + fade（更优雅）
- 关闭动画（新增退出动画）

**搜索框：**
- 增加 focus 时的发光效果（`box-shadow` glow）
- 搜索图标在聚焦时变色

**排序控件：**
- 下拉框改为自定义外观
- 排序方向按钮增加旋转动画

**标签选择器：**
- 选中/取消选中增加弹性动画
- 颜色点增加微动效

**修改文件：** `renderer/css/components.css`

### Phase 5: 动画系统（新增 animations.css）

新增统一的关键帧动画库：

```css
/* 入场动画 */
@keyframes fadeIn         /* 淡入 */
@keyframes slideUp        /* 从下方滑入 */
@keyframes slideDown      /* 从上方滑入 */
@keyframes scaleIn        /* 缩放淡入 */
@keyframes slideInRight   /* 从右侧滑入 */

/* 交互动画 */
@keyframes checkBounce    /* 完成打勾弹跳 */
@keyframes pulse          /* 脉动（进行中状态） */
@keyframes shimmer        /* 加载闪烁 */
@keyframes shake          /* 错误抖动 */

/* 列表动画 */
@keyframes staggeredEntry /* 列表项依次进入 */
```

**修改文件：** 新建 `renderer/css/animations.css`，在 `index.html` 中引入

### Phase 6: Todo 卡片渲染逻辑升级（todo-list.js）

1. 卡片添加 `animation-delay` 实现 staggered 入场效果（每张卡片延迟 30ms）
2. 状态切换时添加过渡动画类名
3. 删除时添加淡出 + 缩小动画（而非瞬间消失）
4. 新增卡片时添加从上方滑入动画
5. 高亮效果改为发光脉动（而非简单的 box-shadow）

**修改文件：** `renderer/js/todo-list.js`

### Phase 7: 模态框交互升级（todo-form.js + tag-manager.js）

1. 模态框打开/关闭添加 CSS 类名切换（配合新动画）
2. 保存成功后添加短暂的成功反馈（绿色闪光）
3. 表单验证失败时输入框抖动动画

**修改文件：** `renderer/js/todo-form.js`, `renderer/js/tag-manager.js`

### Phase 8: 主题切换动画（theme-toggle.js）

1. 切换时添加全页面过渡动画
2. 太阳/月亮图标添加旋转 + 缩放切换效果

**修改文件：** `renderer/js/theme-toggle.js`

### Phase 9: 空状态美化

1. 空状态图标改为更精致的 SVG 插画
2. 添加浮动微动画

**修改文件：** `renderer/index.html`（空状态 SVG）

### Phase 10: Widget 小组件同步升级（widget.css）

1. Widget 也应用 Bento 风格的卡片设计
2. 更新配色以匹配新主题

**修改文件：** `renderer/css/widget.css`

---

## 📋 文件修改清单

| 文件 | 操作 | 改动级别 |
|------|------|----------|
| `renderer/css/variables.css` | 修改 | ⭐⭐⭐ 大改 |
| `renderer/css/base.css` | 修改 | ⭐⭐ 中改 |
| `renderer/css/layout.css` | 修改 | ⭐⭐⭐ 大改 |
| `renderer/css/components.css` | 修改 | ⭐⭐⭐ 大改 |
| `renderer/css/animations.css` | 新建 | ⭐⭐ 中改 |
| `renderer/css/widget.css` | 修改 | ⭐⭐ 中改 |
| `renderer/index.html` | 修改 | ⭐ 小改（添加 CSS 引入 + 空状态美化）|
| `renderer/js/todo-list.js` | 修改 | ⭐⭐ 中改 |
| `renderer/js/todo-form.js` | 修改 | ⭐ 小改 |
| `renderer/js/tag-manager.js` | 修改 | ⭐ 小改 |
| `renderer/js/theme-toggle.js` | 修改 | ⭐ 小改 |

**总计：** 10 个文件修改 + 1 个文件新建

---

## ⚠️ 注意事项

1. **CSP 限制**：不加载外部字体/CDN，所有资源必须本地
2. **不修改功能逻辑**：所有 CRUD、过滤、排序逻辑保持不变
3. **保持数据兼容**：不修改 main 进程的任何代码（store, IPC 等）
4. **`prefers-reduced-motion` 支持**：为动画敏感用户提供减弱选项
5. **Light/Dark 双模式**：所有修改必须同时适配两种主题
