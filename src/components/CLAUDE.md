# Folder: src/components
> L2 | 父级: src/CLAUDE.md

> UI 组件层，负责所有弹窗、表单与详情展示，与 App.tsx 通过 props 通信。

## 成员清单
- `BrandIcon.tsx`: 品牌图标映射层，分类名 → 对应 SVG logo（OpenAI/Gemini/Midjourney 用 simpleicons 路径，其余用 lucide）
- `Sidebar.tsx`: 左侧固定导航栏，分类列表 + 新增入口
- `CategoryGrid.tsx`: 首页卡片网格视图，展示所有分类
- `AccountsTable.tsx`: 分类详情表格视图，展示该分类下的账号列表
- `AccountForm.tsx`: 账号新增/编辑弹窗表单，收集并提交账号数据
- `AccountDetailModal.tsx`: 账号详情弹窗，展示账号信息并支持字段复制
- `CategoryForm.tsx`: 分类新增弹窗表单

**⚠️ 自指声明**：一旦本文件夹新增/删除/修改文件或职责变动，请立即更新本文档。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
