var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_crypto = __toESM(require("crypto"), 1);
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_path = __toESM(require("path"), 1);
var PORT = 6721;
var DB_PATH = "accounts.db";
var db = new import_better_sqlite3.default(DB_PATH);
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
try {
  db.exec(`ALTER TABLE accounts ADD COLUMN url TEXT DEFAULT ''`);
} catch {
}
try {
  db.exec(`ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0`);
} catch {
}
try {
  db.exec(`ALTER TABLE accounts ADD COLUMN sort_order INTEGER DEFAULT 0`);
} catch {
}
try {
  db.exec(`ALTER TABLE categories ADD COLUMN icon TEXT DEFAULT ''`);
} catch {
}
function seedDatabase() {
  const insertCat = db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
  const psaiId = insertCat.run("PS\u8D26\u53F7", "PS\u76F8\u5173\u8D26\u53F7\u4FE1\u606F").lastInsertRowid;
  const mjId = insertCat.run("Midjourney\u8D26\u53F7", "Midjourney\u76F8\u5173\u8D26\u53F7\u4FE1\u606F").lastInsertRowid;
  const gptId = insertCat.run("GPT", "GPT\u76F8\u5173\u8D26\u53F7").lastInsertRowid;
  const apiId = insertCat.run("API\u79D8\u94A5", "\u5404\u7C7BAPI Key").lastInsertRowid;
  const kbId = insertCat.run("\u77E5\u8BC6\u5E93\u5DE5\u5177", "\u77E5\u8BC6\u5E93\u76F8\u5173\u8D26\u53F7").lastInsertRowid;
  insertCat.run("Gemini", "Gemini\u76F8\u5173\u8D26\u53F7");
  const jimengId = insertCat.run("\u5373\u68A6", "\u5373\u68A6\u9AD8\u7EA7\u4F1A\u5458").lastInsertRowid;
  const ins = db.prepare(
    "INSERT INTO accounts (category_id, title, username, password, extra_info, url) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const extra = (obj) => JSON.stringify(obj);
  const psEmails = [
    "jijvyjle@pslrai.com",
    "ufccavqn@pslrai.com",
    "qpevcpfk@pslrai.com",
    "vbdyuxms@pslrai.com",
    "sqmdohch@pslrai.com",
    "tejekvhx@pslrai.com",
    "yerffihy@pslrai.com",
    "aahahscj@pslrai.com",
    "xjqjjlxr@pslrai.com",
    "wvdatyuy@pslrai.com"
  ];
  const cnNums = ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D", "\u5341"];
  const psExtra = extra({ "\u9A8C\u8BC1\u7801\u67E5\u8BE2\u5730\u5740": "http://120.55.250.253:3000", "\u5907\u6CE8": "\u78B0\u5230\u7ED1\u5B9A\u624B\u673A\u53F7\u548C\u5907\u7528\u90AE\u7BB1\u70B9\u51FB\u6682\u4E0D(not now)" });
  psEmails.forEach((email, i) => ins.run(psaiId, `PS\u8D26\u53F7${cnNums[i]}`, email, "Ps123456///", psExtra, ""));
  ins.run(
    mjId,
    "\u8D26\u53F71 (\u7BA1\u7406\u5458: lolixiao)",
    "lolixiao, sokywang, ppxu, bearloli, cherryzheng, jaceywang, zheshunfu",
    "",
    "",
    "https://www.midjourney.com/"
  );
  ins.run(
    mjId,
    "\u8D26\u53F72 (\u7BA1\u7406\u5458: zhiyingpan)",
    "zhiyingpan, sansanyu, toriliang, pellchen, sisishi, gavinnsu, zorazhao",
    "",
    "",
    "https://www.midjourney.com/"
  );
  ins.run(gptId, "gpt\u8D26\u53F7 (\u7B4926\u5E74\u7ECF\u8D39)", "View your shared item | 1Password", "", "", "https://chatgpt.com/");
  ins.run(apiId, "gpt\u79D8\u94A5", "sk-proj-N1QziI5g283u1PeJKxgn4iRRXdQIrWe2...", "", "", "");
  ins.run(
    kbId,
    "AI\u77E5\u8BC6\u5E93\u5DE5\u5177-flowith",
    "a1305820810@gmail.com",
    "Lx123456",
    extra({ "\u5730\u5740": "https://flowith.io/blank" }),
    "https://flowith.io/blank"
  );
  ins.run(jimengId, "\u627Elibiaolai(\u8D56\u674E\u6807)\u626B\u7801\u767B\u5F55", "", "", "", "");
}
var { count } = db.prepare("SELECT COUNT(*) as count FROM categories").get();
if (count === 0)
  seedDatabase();
var activeSessions = /* @__PURE__ */ new Set();
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !activeSessions.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
function registerAuthRoutes(app) {
  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      res.status(401).json({ error: "\u5BC6\u7801\u9519\u8BEF" });
      return;
    }
    const token = import_crypto.default.randomUUID();
    activeSessions.add(token);
    res.json({ token });
  });
  app.post("/api/auth/member-login", (req, res) => {
    const { password } = req.body;
    const memberPassword = process.env.MEMBER_PASSWORD;
    if (!memberPassword || password !== memberPassword) {
      res.status(401).json({ error: "\u5BC6\u7801\u9519\u8BEF" });
      return;
    }
    res.json({ ok: true });
  });
  app.post("/api/auth/logout", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token)
      activeSessions.delete(token);
    res.json({ success: true });
  });
  app.get("/api/auth/check", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    res.json({ isAdmin: !!(token && activeSessions.has(token)) });
  });
}
function reorderCategories(ids) {
  const stmt = db.prepare("UPDATE categories SET sort_order = ? WHERE id = ?");
  ids.forEach((id, i) => stmt.run(i, id));
}
function registerCategoryRoutes(app) {
  app.get("/api/categories", (_req, res) => {
    res.json(db.prepare("SELECT * FROM categories ORDER BY sort_order, id").all());
  });
  app.post("/api/categories", requireAdmin, (req, res) => {
    const { name, description, icon } = req.body;
    const r = db.prepare("INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)").run(name, description || "", icon || "");
    res.json({ id: r.lastInsertRowid });
  });
  app.put("/api/categories/reorder", requireAdmin, (req, res) => {
    reorderCategories(req.body.ids);
    res.json({ success: true });
  });
  app.put("/api/categories/:id", requireAdmin, (req, res) => {
    const { name, description, icon } = req.body;
    db.prepare("UPDATE categories SET name=?, description=?, icon=? WHERE id=?").run(name, description || "", icon || "", req.params.id);
    res.json({ success: true });
  });
  app.delete("/api/categories/:id", requireAdmin, (req, res) => {
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });
}
function queryAccounts(category_id) {
  if (category_id)
    return db.prepare("SELECT * FROM accounts WHERE category_id = ? ORDER BY sort_order, id").all(category_id);
  return db.prepare("SELECT * FROM accounts ORDER BY category_id, sort_order, id").all();
}
function createAccount(body) {
  const { category_id, title, username, password, extra_info, url } = body;
  return db.prepare(
    "INSERT INTO accounts (category_id, title, username, password, extra_info, url) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(category_id, title, username || "", password || "", extra_info || "", url || "");
}
function updateAccount(id, body) {
  const { title, username, password, extra_info, url } = body;
  db.prepare("UPDATE accounts SET title=?, username=?, password=?, extra_info=?, url=? WHERE id=?").run(title, username || "", password || "", extra_info || "", url || "", id);
}
function registerAccountRoutes(app) {
  app.get("/api/accounts", (req, res) => res.json(queryAccounts(req.query.category_id)));
  app.post("/api/accounts", requireAdmin, (req, res) => res.json({ id: createAccount(req.body).lastInsertRowid }));
  app.put("/api/accounts/reorder", requireAdmin, (req, res) => {
    const { ids } = req.body;
    const stmt = db.prepare("UPDATE accounts SET sort_order = ? WHERE id = ?");
    ids.forEach((id, i) => stmt.run(i, id));
    res.json({ success: true });
  });
  app.put("/api/accounts/:id", requireAdmin, (req, res) => {
    updateAccount(req.params.id, req.body);
    res.json({ success: true });
  });
  app.delete("/api/accounts/:id", requireAdmin, (req, res) => {
    db.prepare("DELETE FROM accounts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  registerAuthRoutes(app);
  registerCategoryRoutes(app);
  registerAccountRoutes(app);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(import_express.default.static(import_path.default.join(__dirname, "dist")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}
startServer();
