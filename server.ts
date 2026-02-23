/**
 * [INPUT]: better-sqlite3, express, vite - 外部依赖
 * [OUTPUT]: HTTP 服务，暴露 /api/categories 与 /api/accounts RESTful 接口
 * [POS]: 应用后端入口，SQLite 数据库初始化 + Express + Vite 中间件
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';

const PORT = 3000;
const DB_PATH = 'accounts.db';

// ─── DB Init ──────────────────────────────────────────────────────────────────
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    username TEXT,
    password TEXT,
    extra_info TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
  );
`);

// ─── Seed ─────────────────────────────────────────────────────────────────────
function seedDatabase() {
  const insertCat = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  const psaiId  = insertCat.run('PSai账号',      'PSai相关账号信息').lastInsertRowid;
  const mjId    = insertCat.run('Midjourney账号', 'Midjourney相关账号信息').lastInsertRowid;
  const gptId   = insertCat.run('GPT',           'GPT相关账号').lastInsertRowid;
  const apiId   = insertCat.run('API秘钥',        '各类API Key').lastInsertRowid;
  const kbId    = insertCat.run('知识库工具',     '知识库相关账号').lastInsertRowid;
  insertCat.run('Gemini', 'Gemini相关账号');

  const ins = db.prepare(
    'INSERT INTO accounts (category_id, title, username, password, extra_info) VALUES (?, ?, ?, ?, ?)'
  );
  const extra = (obj: object) => JSON.stringify(obj);

  // PSai
  const psaiList = [
    { title: 'jensjiang(蒋昌盛)', user: 'fpxxkdf513@outlook.com',
      info: { '辅助邮箱': '5rdwt3fy@tunn.site', '辅助邮箱密码': 'Ps123456' } },
    { title: 'sansanyu(余静珠)', user: 'Rcs0nf6P@psai.live',
      info: { '辅助邮箱': '5fpjmqy6@tunn.site', '辅助邮箱密码': 'Ps123456',
              '验证码查询地址': 'https://cha.psai.live/' } },
    { title: 'toriliang(梁芯僮)', user: 'ljrlvivs074@outlook.com',
      info: { '辅助邮箱': '1tutx52o@tunn.site', '辅助邮箱密码': 'Ps123456' } },
    { title: 'ppxu(徐世存)', user: 'ogudmqx225@outlook.com',
      info: { '辅助邮箱': '1hdvy00l@tunn.site', '辅助邮箱密码': 'Ps123456' } },
  ];
  psaiList.forEach(a => ins.run(psaiId, a.title, a.user, 'Ps123456///', extra(a.info)));

  // Midjourney
  ins.run(mjId, '账号1 (管理员: lolixiao)',
    'lolixiao, sokywang, ppxu, bearloli, cherryzheng, jaceywang, zheshunfu', '', '');
  ins.run(mjId, '账号2 (管理员: zhiyingpan)',
    'zhiyingpan, sansanyu, toriliang, pellchen, sisishi, gavinnsu, zorazhao', '', '');

  // GPT / API / 知识库
  ins.run(gptId, 'gpt账号 (等26年经费)', 'View your shared item | 1Password', '', '');
  ins.run(apiId, 'gpt秘钥', 'sk-proj-N1QziI5g283u1PeJKxgn4iRRXdQIrWe2...', '', '');
  ins.run(kbId,  'AI知识库工具-flowith', 'a1305820810@gmail.com', 'Lx123456',
    extra({ '地址': 'https://flowith.io/blank' }));
}

const { count } = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
if (count === 0) seedDatabase();

// ─── Routes ───────────────────────────────────────────────────────────────────
function registerCategoryRoutes(app: express.Application) {
  app.get('/api/categories', (_req, res) => {
    res.json(db.prepare('SELECT * FROM categories ORDER BY id').all());
  });
  app.post('/api/categories', (req, res) => {
    const { name, description } = req.body;
    const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description || '');
    res.json({ id: result.lastInsertRowid });
  });
  app.delete('/api/categories/:id', (req, res) => {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });
}

function queryAccounts(category_id: unknown) {
  if (category_id)
    return db.prepare('SELECT * FROM accounts WHERE category_id = ? ORDER BY id').all(category_id);
  return db.prepare('SELECT * FROM accounts ORDER BY category_id, id').all();
}

function createAccount(body: Record<string, string>) {
  const { category_id, title, username, password, extra_info } = body;
  return db.prepare(
    'INSERT INTO accounts (category_id, title, username, password, extra_info) VALUES (?, ?, ?, ?, ?)'
  ).run(category_id, title, username || '', password || '', extra_info || '');
}

function updateAccount(id: string, body: Record<string, string>) {
  const { title, username, password, extra_info } = body;
  db.prepare('UPDATE accounts SET title=?, username=?, password=?, extra_info=? WHERE id=?')
    .run(title, username || '', password || '', extra_info || '', id);
}

function registerAccountRoutes(app: express.Application) {
  app.get('/api/accounts', (req, res) => res.json(queryAccounts(req.query.category_id)));
  app.post('/api/accounts', (req, res) => res.json({ id: createAccount(req.body).lastInsertRowid }));
  app.put('/api/accounts/:id', (req, res) => { updateAccount(req.params.id, req.body); res.json({ success: true }); });
  app.delete('/api/accounts/:id', (req, res) => {
    db.prepare('DELETE FROM accounts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });
}

// ─── Server ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  app.use(express.json());
  registerCategoryRoutes(app);
  registerAccountRoutes(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
