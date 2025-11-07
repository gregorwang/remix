import Database from "better-sqlite3";
import path from "path";

// 数据库文件路径
const dbPath = process.env.NODE_ENV === "production"
  ? path.join(process.cwd(), "data", "app.db")
  : path.join(process.cwd(), "app.db");

console.log(`[Database] Using database at: ${dbPath}`);

// 创建数据库连接
export const db = new Database(dbPath);

// 启用WAL模式（提升并发性能）
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// 初始化数据库表
export function initializeDatabase() {
  console.log("[Database] Initializing tables...");

  db.exec(`
    -- 用户表
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      emailVerified INTEGER DEFAULT 0,
      name TEXT,
      image TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    -- 会话表（Better Auth需要）
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expiresAt INTEGER NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      userId TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );

    -- 账户表（OAuth需要）
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      userId TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      idToken TEXT,
      expiresAt INTEGER,
      password TEXT,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );

    -- 验证表（Magic Link需要）
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt INTEGER NOT NULL
    );

    -- 留言表
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
    );

    -- 索引优化
    CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
    CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);
    CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
  `);

  console.log("[Database] Tables initialized successfully");
}

// 应用启动时初始化数据库
initializeDatabase();

// 优雅关闭
if (typeof process !== "undefined") {
  process.on("exit", () => {
    db.close();
  });
  process.on("SIGINT", () => {
    db.close();
    process.exit(0);
  });
}
