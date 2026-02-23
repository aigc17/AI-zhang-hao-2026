/**
 * [INPUT]: better-sqlite3, express, vite, dotenv - 外部依赖
 * [OUTPUT]: HTTP 服务，暴露 /api/categories、/api/accounts、/api/auth RESTful 接口
 * [POS]: 应用后端入口，SQLite 数据库初始化 + Express + Vite 中间件 + 管理员认证
 *
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import 'dotenv/config';
import crypto from 'crypto';
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

// ─── Migration ────────────────────────────────────────────────────────────────
try { db.exec(`ALTER TABLE accounts ADD COLUMN url TEXT DEFAULT ''`); } catch { /* already exists */ }
try { db.exec(`ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0`); } catch { /* already exists */ }
try { db.exec(`ALTER TABLE accounts ADD COLUMN sort_order INTEGER DEFAULT 0`); } catch { /* already exists */ }
try { db.exec(`ALTER TABLE categories ADD COLUMN icon TEXT DEFAULT ''`); } catch { /* already exists */ }

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
    'INSERT INTO accounts (category_id, title, username, password, extra_info, url) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const extra = (obj: object) => JSON.stringify(obj);

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
  psaiList.forEach(a => ins.run(psaiId, a.title, a.user, 'Ps123456///', extra(a.info), 'https://psai.live/'));

  ins.run(mjId, '账号1 (管理员: lolixiao)',
    'lolixiao, sokywang, ppxu, bearloli, cherryzheng, jaceywang, zheshunfu', '', '', 'https://www.midjourney.com/');
  ins.run(mjId, '账号2 (管理员: zhiyingpan)',
    'zhiyingpan, sansanyu, toriliang, pellchen, sisishi, gavinnsu, zorazhao', '', '', 'https://www.midjourney.com/');

  ins.run(gptId, 'gpt账号 (等26年经费)', 'View your shared item | 1Password', '', '', 'https://chatgpt.com/');
  ins.run(apiId, 'gpt秘钥', 'sk-proj-N1QziI5g283u1PeJKxgn4iRRXdQIrWe2...', '', '', '');
  ins.run(kbId,  'AI知识库工具-flowith', 'a1305820810@gmail.com', 'Lx123456',
    extra({ '地址': 'https://flowith.io/blank' }), 'https://flowith.io/blank');
}

const { count } = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
if (count === 0) seedDatabase();

// ─── Auth ─────────────────────────────────────────────────────────────────────
const activeSessions = new Set<string>();

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !activeSessions.has(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

function registerAuthRoutes(app: express.Application) {
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      res.status(401).json({ error: '密码错误' });
      return;
    }
    const token = crypto.randomUUID();
    activeSessions.add(token);
    res.json({ token });
  });

  app.post('/api/auth/member-login', (req, res) => {
    const { password } = req.body;
    const memberPassword = process.env.MEMBER_PASSWORD;
    if (!memberPassword || password !== memberPassword) {
      res.status(401).json({ error: '密码错误' });
      return;
    }
    res.json({ ok: true });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) activeSessions.delete(token);
    res.json({ success: true });
  });

  app.get('/api/auth/check', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    res.json({ isAdmin: !!(token && activeSessions.has(token)) });
  });
}

// ─── Category Routes ──────────────────────────────────────────────────────────
function reorderCategories(ids: number[]) {
  const stmt = db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?');
  ids.forEach((id, i) => stmt.run(i, id));
}

function registerCategoryRoutes(app: express.Application) {
  app.get('/api/categories', (_req, res) => {
    res.json(db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all());
  });
  app.post('/api/categories', requireAdmin, (req, res) => {
    const { name, description, icon } = req.body;
    const r = db.prepare('INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)').run(name, description || '', icon || '');
    res.json({ id: r.lastInsertRowid });
  });
  app.put('/api/categories/reorder', requireAdmin, (req, res) => {
    reorderCategories((req.body as { ids: number[] }).ids);
    res.json({ success: true });
  });
  app.put('/api/categories/:id', requireAdmin, (req, res) => {
    const { name, description, icon } = req.body;
    db.prepare('UPDATE categories SET name=?, description=?, icon=? WHERE id=?')
      .run(name, description || '', icon || '', req.params.id);
    res.json({ success: true });
  });
  app.delete('/api/categories/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });
}

// ─── Account Routes ───────────────────────────────────────────────────────────
function queryAccounts(category_id: unknown) {
  if (category_id)
    return db.prepare('SELECT * FROM accounts WHERE category_id = ? ORDER BY sort_order, id').all(category_id);
  return db.prepare('SELECT * FROM accounts ORDER BY category_id, sort_order, id').all();
}

function createAccount(body: Record<string, string>) {
  const { category_id, title, username, password, extra_info, url } = body;
  return db.prepare(
    'INSERT INTO accounts (category_id, title, username, password, extra_info, url) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(category_id, title, username || '', password || '', extra_info || '', url || '');
}

function updateAccount(id: string, body: Record<string, string>) {
  const { title, username, password, extra_info, url } = body;
  db.prepare('UPDATE accounts SET title=?, username=?, password=?, extra_info=?, url=? WHERE id=?')
    .run(title, username || '', password || '', extra_info || '', url || '', id);
}

function registerAccountRoutes(app: express.Application) {
  app.get('/api/accounts', (req, res) => res.json(queryAccounts(req.query.category_id)));
  app.post('/api/accounts', requireAdmin, (req, res) => res.json({ id: createAccount(req.body).lastInsertRowid }));
  app.put('/api/accounts/reorder', requireAdmin, (req, res) => {
    const { ids } = req.body as { ids: number[] };
    const stmt = db.prepare('UPDATE accounts SET sort_order = ? WHERE id = ?');
    ids.forEach((id, i) => stmt.run(i, id));
    res.json({ success: true });
  });
  app.put('/api/accounts/:id', requireAdmin, (req, res) => { updateAccount(req.params.id, req.body); res.json({ success: true }); });
  app.delete('/api/accounts/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM accounts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });
}

// ─── Server ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  app.use(express.json());
  registerAuthRoutes(app);
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
