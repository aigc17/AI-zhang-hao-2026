import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const PORT = 3000;
const DB_PATH = 'accounts.db';

// Initialize Database
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

// Seed data if empty
const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
if (catCount.count === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  const psaiId = insertCat.run('PSai账号', 'PSai相关账号信息').lastInsertRowid;
  const mjId = insertCat.run('Midjourney账号', 'Midjourney相关账号信息').lastInsertRowid;
  const aiId = insertCat.run('AI账号', '其他AI工具账号').lastInsertRowid;
  const apiId = insertCat.run('API秘钥', '各类API Key').lastInsertRowid;
  const kbId = insertCat.run('知识库工具', '知识库相关账号').lastInsertRowid;

  const insertAcc = db.prepare('INSERT INTO accounts (category_id, title, username, password, extra_info) VALUES (?, ?, ?, ?, ?)');
  
  // PSai Accounts
  const psaiAccounts = [
    { title: 'jensjiang(蒋昌盛)', username: 'fpxxkdf513@outlook.com', extra: { '辅助邮箱': '5rdwt3fy@tunn.site', '辅助邮箱密码': 'Ps123456' } },
    { title: 'sansanyu(余静珠)', username: 'Rcs0nf6P@psai.live', extra: { '辅助邮箱': '5fpjmqy6@tunn.site', '辅助邮箱密码': 'Ps123456', '验证码查询地址': 'https://cha.psai.live/' } },
    { title: 'toriliang(梁芯僮)', username: 'ljrlvivs074@outlook.com', extra: { '辅助邮箱': '1tutx52o@tunn.site', '辅助邮箱密码': 'Ps123456' } },
    { title: 'ppxu(徐世存)', username: 'ogudmqx225@outlook.com', extra: { '辅助邮箱': '1hdvy00l@tunn.site', '辅助邮箱密码': 'Ps123456' } },
  ];
  psaiAccounts.forEach(acc => insertAcc.run(psaiId, acc.title, acc.username, 'Ps123456///', JSON.stringify(acc.extra)));

  // Midjourney Accounts
  const mjAccounts = [
    { title: '账号1 (管理员: lolixiao)', username: 'lolixiao, sokywang, ppxu, bearloli, cherryzheng, jaceywang, zheshunfu' },
    { title: '账号2 (管理员: zhiyingpan)', username: 'zhiyingpan, sansanyu, toriliang, pellchen, sisishi, gavinnsu, zorazhao' },
  ];
  mjAccounts.forEach(acc => insertAcc.run(mjId, acc.title, acc.username, '', ''));

  // AI Accounts
  insertAcc.run(aiId, 'gpt账号 (等26年经费)', 'View your shared item | 1Password', '', '');

  // API Accounts
  insertAcc.run(apiId, 'gpt秘钥', 'sk-proj-N1QziI5g283u1PeJKxgn4iRRXdQIrWe2...', '', '');

  // Knowledge Base
  insertAcc.run(kbId, 'AI知识库工具-flowith', 'a1305820810@gmail.com', 'Lx123456', JSON.stringify({ '地址': 'https://flowith.io/blank' }));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes for Categories
  app.get('/api/categories', (req, res) => {
    try {
      const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', (req, res) => {
    try {
      const { name, description } = req.body;
      const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description || '');
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  app.delete('/api/categories/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // API Routes for Accounts
  app.get('/api/accounts', (req, res) => {
    try {
      const { category_id } = req.query;
      let accounts;
      if (category_id) {
        accounts = db.prepare('SELECT * FROM accounts WHERE category_id = ? ORDER BY id').all(category_id);
      } else {
        accounts = db.prepare('SELECT * FROM accounts ORDER BY category_id, id').all();
      }
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  });

  app.post('/api/accounts', (req, res) => {
    try {
      const { category_id, title, username, password, extra_info } = req.body;
      const result = db.prepare('INSERT INTO accounts (category_id, title, username, password, extra_info) VALUES (?, ?, ?, ?, ?)').run(
        category_id, title, username || '', password || '', extra_info || ''
      );
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create account' });
    }
  });

  app.put('/api/accounts/:id', (req, res) => {
    try {
      const { title, username, password, extra_info } = req.body;
      db.prepare('UPDATE accounts SET title = ?, username = ?, password = ?, extra_info = ? WHERE id = ?').run(
        title, username || '', password || '', extra_info || '', req.params.id
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update account' });
    }
  });

  app.delete('/api/accounts/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM accounts WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
