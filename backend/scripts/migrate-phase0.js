const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.resolve(__dirname, "../data/database.sqlite");
const BACKUP_PATH = path.resolve(__dirname, "../data/database-backup.db");

if (fs.existsSync(DB_PATH)) {
  fs.copyFileSync(DB_PATH, BACKUP_PATH);
  console.log("✓ Backup creado:", BACKUP_PATH);
}

async function migrate() {
  const SQL = await initSqlJs();
  let db;

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");

  function run(sql) {
    try { db.run(sql); } catch (err) { console.log(`  ⚠ ${err.message}`); }
  }

  function tableExists(name) {
    const r = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`);
    return r.length > 0 && r[0].values.length > 0;
  }

  function columnExists(table, col) {
    const r = db.exec(`PRAGMA table_info(${table})`);
    if (r.length === 0) return false;
    return r[0].values.some(c => c[1] === col);
  }

  console.log("\n=== Migración MotoPro Phase 0 ===\n");

  // --- Renombrar orders → store_orders ---
  if (tableExists("orders") && !tableExists("store_orders")) {
    console.log("  → Renombrando orders → store_orders...");
    run("ALTER TABLE orders RENAME TO store_orders");
    console.log("  ✓ store_orders listo");
  } else if (tableExists("store_orders")) {
    console.log("  ✓ store_orders ya existe");
  } else {
    console.log("  ✓ orders no encontrado (nueva DB)");
  }

  // --- Eliminar service_requests si existe ---
  if (tableExists("service_requests")) {
    if (tableExists("work_orders")) {
      console.log("  → Migrando service_requests → work_orders...");
      const requests = db.exec("SELECT * FROM service_requests");
      if (requests.length > 0) {
        const rows = requests[0].values;
        for (const row of rows) {
          const id = row[0] || `wo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          const orderNumber = `MP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;
          const customerId = row[1] || null;
          const vehicleId = row[2] || null;
          const status = row[3] === "pending" ? "received" : row[3] === "in_progress" ? "diagnosed" : row[3] === "completed" ? "delivered" : "received";
          const desc = row[4] || row[5] || "";
          const createdAt = row[6] || new Date().toISOString();
          run(`INSERT OR IGNORE INTO work_orders (id, order_number, customer_id, vehicle_id, status, description, created_at) VALUES ('${id}', '${orderNumber}', '${customerId}', '${vehicleId}', '${status}', '${desc.replace(/'/g, "''")}', '${createdAt}')`);
        }
        console.log(`    → ${rows.length} registros migrados`);
      }
      run("DROP TABLE service_requests");
      console.log("  ✓ service_requests eliminado");
    } else {
      run("DROP TABLE service_requests");
      console.log("  ✓ service_requests eliminado (sin work_orders aún)");
    }
  } else {
    console.log("  ✓ service_requests no existe");
  }

  // --- Crear tablas faltantes ---
  const tables = [
    `CREATE TABLE IF NOT EXISTS work_orders (
      id TEXT PRIMARY KEY, order_number TEXT UNIQUE NOT NULL, customer_id TEXT,
      vehicle_id TEXT, status TEXT DEFAULT 'received', priority TEXT DEFAULT 'normal',
      description TEXT DEFAULT '', diagnosis TEXT DEFAULT '', assigned_to TEXT,
      estimated_completion TEXT, subtotal REAL DEFAULT 0, tax REAL DEFAULT 0,
      discount REAL DEFAULT 0, total REAL DEFAULT 0, internal_notes TEXT DEFAULT '',
      customer_notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS diagnostics (
      id TEXT PRIMARY KEY, work_order_id TEXT NOT NULL,
      findings TEXT DEFAULT '', recommendation TEXT DEFAULT '',
      severity TEXT DEFAULT 'low', created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY, quote_number TEXT UNIQUE NOT NULL, work_order_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending', subtotal REAL DEFAULT 0, tax REAL DEFAULT 0,
      discount REAL DEFAULT 0, total REAL DEFAULT 0, notes TEXT DEFAULT '',
      valid_until TEXT, created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS work_order_parts (
      id TEXT PRIMARY KEY, work_order_id TEXT NOT NULL, product_id TEXT,
      part_name TEXT, quantity INTEGER DEFAULT 1, unit_price REAL DEFAULT 0,
      total_price REAL DEFAULT 0, is_approved INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS work_order_timeline (
      id TEXT PRIMARY KEY, work_order_id TEXT NOT NULL, action TEXT NOT NULL,
      description TEXT DEFAULT '', performed_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, contact_name TEXT DEFAULT '',
      email TEXT DEFAULT '', phone TEXT DEFAULT '', address TEXT DEFAULT '',
      city TEXT DEFAULT '', nit TEXT DEFAULT '', notes TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS cash_register (
      id TEXT PRIMARY KEY, opening_amount REAL DEFAULT 0, closing_amount REAL,
      total_income REAL DEFAULT 0, total_expenses REAL DEFAULT 0,
      expected_balance REAL DEFAULT 0, actual_balance REAL DEFAULT 0,
      difference REAL DEFAULT 0, status TEXT DEFAULT 'open',
      opened_by TEXT, closed_by TEXT, notes TEXT DEFAULT '',
      opened_at TEXT DEFAULT (datetime('now')),
      closed_at TEXT, updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS cash_transactions (
      id TEXT PRIMARY KEY, cash_register_id TEXT NOT NULL,
      type TEXT NOT NULL, category TEXT NOT NULL, amount REAL DEFAULT 0,
      description TEXT DEFAULT '', reference_type TEXT, reference_id TEXT,
      payment_method TEXT DEFAULT 'cash', created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT, customer_id TEXT,
      type TEXT NOT NULL, title TEXT NOT NULL, message TEXT DEFAULT '',
      entity_type TEXT, entity_id TEXT, is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  ];

  for (const sql of tables) {
    run(sql);
  }

  // --- Agregar columnas faltantes ---
  const alters = {
    customers: [
      ["default_vehicle_id", "TEXT"],
      ["total_services", "INTEGER DEFAULT 0"],
      ["last_service_date", "TEXT"],
      ["preferred_contact", "TEXT DEFAULT 'phone'"],
      ["notes", "TEXT DEFAULT ''"]
    ],
    products: [
      ["min_stock", "INTEGER DEFAULT 0"],
      ["max_stock", "INTEGER DEFAULT 0"],
      ["reorder_point", "INTEGER DEFAULT 0"],
      ["location", "TEXT DEFAULT ''"]
    ],
    team_members: [
      ["user_id", "TEXT"]
    ],
    purchases: [
      ["supplier_id", "TEXT"]
    ]
  };

  for (const [table, cols] of Object.entries(alters)) {
    if (!tableExists(table)) continue;
    for (const [col, def] of cols) {
      if (!columnExists(table, col)) {
        run(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
        console.log(`  ✓ ${table}.${col} agregada`);
      }
    }
  }

  // --- Índices ---
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(status)",
    "CREATE INDEX IF NOT EXISTS idx_store_orders_customer ON store_orders(customer_id)",
    "CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status)",
    "CREATE INDEX IF NOT EXISTS idx_work_orders_customer ON work_orders(customer_id)",
    "CREATE INDEX IF NOT EXISTS idx_diagnostics_work_order ON diagnostics(work_order_id)",
    "CREATE INDEX IF NOT EXISTS idx_quotes_work_order ON quotes(work_order_id)",
    "CREATE INDEX IF NOT EXISTS idx_work_order_parts_work_order ON work_order_parts(work_order_id)",
    "CREATE INDEX IF NOT EXISTS idx_work_order_timeline_work_order ON work_order_timeline(work_order_id)",
    "CREATE INDEX IF NOT EXISTS idx_cash_register_status ON cash_register(status)",
    "CREATE INDEX IF NOT EXISTS idx_cash_transactions_register ON cash_transactions(cash_register_id)",
    "CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id)"
  ];
  for (const idx of indexes) run(idx);

  // Guardar
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  db.close();

  console.log("\n=== Migración completada ===\n");
}

migrate().catch(err => {
  console.error("Error:", err.message);
  if (fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(BACKUP_PATH, DB_PATH);
    console.log("  → Restaurado desde backup");
  }
  process.exit(1);
});
