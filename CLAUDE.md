# AI账号管理 - AI 账号信息管理工具
React + TypeScript + Express + SQLite + Vite + Tailwind CSS 4

## 目录结构
```
src/          - 前端 React 应用 (主要开发目录)
  components/ - UI 组件层（侧边栏、表单、弹窗、列表）
server.ts     - 后端入口，Express + SQLite + Vite 中间件
```

## 配置文件
- `package.json`   - 依赖与脚本，`dev` 命令启动 tsx server.ts
- `tsconfig.json`  - TypeScript 配置
- `vite.config.ts` - Vite 构建配置
- `index.html`     - SPA 入口 HTML
- `accounts.db`    - SQLite 数据库（运行时生成，勿提交）

## AI 开发注意事项
- 启动命令须在 ASCII 路径下运行（中文路径导致 tsx ESM URL 解析失败）
- tsx 须锁定 3.x，4.x 在 Node 20 + 中文路径下有 ERR_INVALID_URL_SCHEME bug
- 根目录文件为标准 Node.js 项目必需文件，不做子目录拆分

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
