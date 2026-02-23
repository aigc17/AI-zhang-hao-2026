# Folder: src/components
> L2 | 父级: src/CLAUDE.md（若存在）

> UI 组件层，分层组织。全局/布局组件放根目录，领域组件按功能分子目录。

## 成员清单（根目录）
- `Sidebar.tsx`: 左侧导航栏，分类列表 + 拖拽排序 + 三点菜单（管理员模式下可见）
- `BrandIcon.tsx`: 品牌图标映射层，分类名 → SVG logo（simpleicons/lucide 双源）
- `AccessGate.tsx`: 全屏访问门禁，首次访问验证成员密码，通过后 localStorage 永久解锁
- `PasswordModal.tsx`: 管理员密码验证弹窗，双击 logo 触发，密码服务端校验

## 子目录
- `account/` — 账号相关组件（AccountsTable、AccountDetailModal、AccountForm）
- `category/` — 分类相关组件（CategoryGrid、CategoryForm）

**⚠️ 自指声明**：一旦本文件夹新增/删除/修改文件或职责变动，请立即更新本文档。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
