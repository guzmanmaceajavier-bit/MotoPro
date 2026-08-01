const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const DB_PATH = path.resolve(__dirname, "../..", process.env.DB_PATH || "./data/database.sqlite");
let db = null;

function getDb() {
  if (db) return db;
  throw new Error("Database not initialized. Call initDatabase() first.");
}

async function initDatabase() {
  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'administrador',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, image TEXT, alt_image TEXT, accent TEXT,
      is_active INTEGER DEFAULT 1, is_visible_store INTEGER DEFAULT 1,
      models TEXT DEFAULT '[]', sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, image TEXT,
      sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS subcategories (
      id TEXT PRIMARY KEY, category_id TEXT NOT NULL, name TEXT NOT NULL, count INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0, FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, sku TEXT DEFAULT '',
      category_id TEXT NOT NULL, subcategory_id TEXT, brand_id TEXT,
      purchase_price REAL DEFAULT 0, price REAL NOT NULL DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0,
      description TEXT DEFAULT '', image TEXT, is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    );
    CREATE TABLE IF NOT EXISTS service_categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '', features TEXT DEFAULT '[]', icon TEXT DEFAULT 'wrench',
      icon_type TEXT DEFAULT 'lucide', price REAL, duration TEXT DEFAULT '',
      accent TEXT DEFAULT '#F59E0B', is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
      category TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      excerpt TEXT DEFAULT '', content TEXT DEFAULT '', category TEXT DEFAULT '',
      author TEXT DEFAULT '', image TEXT, gradient TEXT DEFAULT '',
      is_published INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS gallery_images (
      id TEXT PRIMARY KEY, label TEXT DEFAULT '', image TEXT, size TEXT DEFAULT 'medium',
      category TEXT DEFAULT 'fotos', sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT DEFAULT '', content TEXT DEFAULT '',
      rating INTEGER DEFAULT 5, image TEXT, is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT DEFAULT '', specialty TEXT DEFAULT '',
      experience TEXT DEFAULT '', description TEXT DEFAULT '', image TEXT,
      sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT DEFAULT '',
      message TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS work_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT DEFAULT '',
      customer_email TEXT DEFAULT '',
      vehicle_id TEXT,
      vehicle_description TEXT DEFAULT '',
      service_type TEXT DEFAULT '',
      description TEXT DEFAULT '',
      diagnosis TEXT DEFAULT '',
      status TEXT DEFAULT 'received',
      priority TEXT DEFAULT 'normal',
      assigned_to TEXT,
      estimated_completion TEXT,
      actual_completion TEXT,
      subtotal REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      is_paid INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS hero_slides (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, subtitle TEXT DEFAULT '',
      description TEXT DEFAULT '', image TEXT, gradient TEXT DEFAULT 'from-purple-600 to-blue-600',
      cta_text TEXT DEFAULT 'Ver más', cta_link TEXT DEFAULT '/tienda',
      sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY, session_id TEXT NOT NULL, product_id TEXT NOT NULL,
      name TEXT NOT NULL, price REAL NOT NULL, quantity INTEGER NOT NULL DEFAULT 1,
      image TEXT, created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS store_orders (
      id TEXT PRIMARY KEY, session_id TEXT NOT NULL,
      customer_name TEXT NOT NULL, customer_email TEXT NOT NULL, customer_phone TEXT DEFAULT '',
      items TEXT NOT NULL, total REAL NOT NULL, status TEXT DEFAULT 'pending',
      payment_method TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS blog_categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT 'bg-purple-500/10 text-purple-400',
      sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS before_after (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, before_image TEXT NOT NULL,
      after_image TEXT NOT NULL, description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      phone TEXT DEFAULT '', address TEXT DEFAULT '', avatar TEXT,
      total_orders INTEGER DEFAULT 0, total_spent REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, description TEXT DEFAULT '',
      discount_type TEXT NOT NULL DEFAULT 'percentage', discount_value REAL NOT NULL DEFAULT 0,
      min_purchase REAL DEFAULT 0, max_uses INTEGER DEFAULT 0, used_count INTEGER DEFAULT 0,
      expires_at TEXT, is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS coupon_usages (
      id TEXT PRIMARY KEY, coupon_id TEXT NOT NULL, customer_id TEXT, customer_email TEXT,
      customer_name TEXT DEFAULT '', order_id TEXT, discount_amount REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL, type TEXT NOT NULL,
      quantity INTEGER NOT NULL, reference TEXT DEFAULT '', notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS offer_slides (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, subtitle TEXT DEFAULT '',
      description TEXT DEFAULT '', image TEXT, gradient TEXT DEFAULT 'from-purple-600 to-pink-500',
      cta_text TEXT DEFAULT 'Ver oferta', cta_link TEXT DEFAULT '/tienda',
      sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL,
      category TEXT DEFAULT 'general', sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL, customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5, title TEXT DEFAULT '', comment TEXT DEFAULT '',
      is_approved INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS company_values (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '',
      icon TEXT DEFAULT 'heart', image TEXT, sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY, user_id TEXT, action TEXT NOT NULL,
      entity_type TEXT, entity_id TEXT, description TEXT DEFAULT '',
      ip TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL, name TEXT NOT NULL,
      description TEXT DEFAULT '', quantity INTEGER DEFAULT 1,
      price REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY, quote_id TEXT NOT NULL, name TEXT NOT NULL,
      description TEXT DEFAULT '', quantity INTEGER DEFAULT 1,
      price REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL, customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL, reason TEXT NOT NULL, status TEXT DEFAULT 'pending',
      items TEXT DEFAULT '[]', refund_amount REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY, supplier TEXT NOT NULL, items TEXT DEFAULT '[]',
      total REAL NOT NULL, status TEXT DEFAULT 'pending', notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS shipping_zones (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, regions TEXT DEFAULT '[]',
      base_cost REAL DEFAULT 0, extra_cost REAL DEFAULT 0, free_minimum REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, provider TEXT NOT NULL DEFAULT 'manual',
      config TEXT DEFAULT '{}', is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS email_config (
      id TEXT PRIMARY KEY, key TEXT UNIQUE NOT NULL, value TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS legal_pages (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      content TEXT DEFAULT '', is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS garage_bays (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, subtitle TEXT DEFAULT '', description TEXT DEFAULT '',
      image TEXT, services TEXT DEFAULT '[]', color TEXT DEFAULT '#FF6B00', is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS process_steps (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '', icon TEXT DEFAULT 'settings',
      color TEXT DEFAULT '#FF6B00', is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '', image TEXT,
      icon TEXT DEFAULT 'building', is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, issuer TEXT DEFAULT '', image TEXT,
      description TEXT DEFAULT '', is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS trust_items (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '', icon TEXT DEFAULT 'shield',
      page TEXT DEFAULT '', is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, description TEXT DEFAULT '',
      permissions TEXT DEFAULT '{}', is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
  `;

  db.run(schema);

  // Seed default roles
  const defaultRoles = [
    { name: 'superadmin', description: 'Acceso total al sistema' },
    { name: 'administrador', description: 'Administración general' },
    { name: 'editor', description: 'Edición de contenido' },
    { name: 'vendedor', description: 'Gestión de ventas y clientes' },
    { name: 'técnico', description: 'Gestión de servicios del taller' },
    { name: 'atención_cliente', description: 'Atención al cliente y soporte' },
  ];
  const existingRoles = db.exec("SELECT COUNT(*) as count FROM roles");
  if (!existingRoles.length || !existingRoles[0].values.length || existingRoles[0].values[0][0] === 0) {
    const roleStmt = db.prepare("INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)");
    defaultRoles.forEach((role, i) => {
      let permissions = {};
      if (role.name === 'superadmin') {
        permissions = { all: true };
      } else if (role.name === 'administrador') {
        permissions = { all: true };
      } else if (role.name === 'editor') {
        permissions = { read: true, create: true, update: true, delete: false };
      } else if (role.name === 'vendedor') {
        permissions = { read: true, create: true, update: true, delete: false };
      } else {
        permissions = { read: true, create: false, update: false, delete: false };
      }
      roleStmt.run([`role_${i + 1}`, role.name, role.description, JSON.stringify(permissions)]);
    });
  }

  // New tables: addresses and wishlist
  db.run(`CREATE TABLE IF NOT EXISTS customer_addresses (
    id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, name TEXT NOT NULL,
    address TEXT NOT NULL, city TEXT DEFAULT '', state TEXT DEFAULT '',
    zip TEXT DEFAULT '', phone TEXT DEFAULT '', is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS wishlist (
    id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, product_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  // Customer settings table
  db.run(`CREATE TABLE IF NOT EXISTS customer_settings (
    id TEXT PRIMARY KEY, customer_id TEXT NOT NULL UNIQUE,
    language TEXT DEFAULT 'es', timezone TEXT DEFAULT 'America/Bogota',
    email_notifications INTEGER DEFAULT 1, push_notifications INTEGER DEFAULT 0,
    sms_notifications INTEGER DEFAULT 0, marketing_emails INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`);

  // Migration: add customer auth columns
  try { db.run("ALTER TABLE customers ADD COLUMN password TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN nit TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN reset_token TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN reset_expires TEXT"); } catch (e) {}
  // Migration: add order detail columns (store_orders)
  try { db.run("ALTER TABLE store_orders ADD COLUMN shipping_address TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE store_orders ADD COLUMN shipping_cost REAL DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE store_orders ADD COLUMN motorcycle TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE store_orders ADD COLUMN nit TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE store_orders ADD COLUMN customer_id TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE cart_items ADD COLUMN customer_id TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0"); } catch (e) {}
  // Vehicles tables
  db.run(`CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY, customer_id TEXT NOT NULL,
    brand TEXT NOT NULL, model TEXT NOT NULL, year TEXT DEFAULT '',
    plate TEXT UNIQUE NOT NULL, vin TEXT DEFAULT '', color TEXT DEFAULT '',
    mileage INTEGER DEFAULT 0, observations TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS vehicle_service_history (
    id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL,
    work_order_id TEXT, description TEXT DEFAULT '',
    mileage_at_service INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS vehicle_photos (
    id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL,
    url TEXT NOT NULL, caption TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS vehicle_documents (
    id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL,
    name TEXT NOT NULL, type TEXT DEFAULT 'other',
    url TEXT DEFAULT '', notes TEXT DEFAULT '',
    expiry_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS vehicle_mileage (
    id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL,
    mileage INTEGER NOT NULL, source TEXT DEFAULT 'manual',
    notes TEXT DEFAULT '',
    recorded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  )`);

  // Migration: add purchase_price to products
  try { db.run("ALTER TABLE products ADD COLUMN purchase_price REAL DEFAULT 0"); } catch (e) {}
  // Migration: add sku to products
  try { db.run("ALTER TABLE products ADD COLUMN sku TEXT DEFAULT ''"); } catch (e) {}
  // Migration: email verification for customers
  try { db.run("ALTER TABLE customers ADD COLUMN email_verified INTEGER DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN verify_token TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN verify_expires TEXT"); } catch (e) {}
  // FASE 0 Migrations: new fields for existing tables
  try { db.run("ALTER TABLE products ADD COLUMN min_stock INTEGER DEFAULT 5"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN max_stock INTEGER DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN reorder_point INTEGER DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN location TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE team_members ADD COLUMN user_id TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN default_vehicle_id TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN total_services INTEGER DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN last_service_date TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN customer_type TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE customers ADD COLUMN notes TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE purchases ADD COLUMN supplier_id TEXT"); } catch (e) {}

  // FASE 2: Product compatibility fields
  try { db.run("ALTER TABLE products ADD COLUMN vehicle_brand TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN vehicle_model TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN vehicle_year_start TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN vehicle_year_end TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN displacement TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN compatible_with TEXT DEFAULT 'universal'"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN weight REAL DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN supplier_id TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN barcode TEXT DEFAULT ''"); } catch (e) {}

  // Product feature fields (displayed in cart/checkout)
  try { db.run("ALTER TABLE products ADD COLUMN warranty TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN quality_label TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN compatibility_text TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE products ADD COLUMN compare_price REAL DEFAULT 0"); } catch (e) {}

  // FASE 2: Purchase enhancement fields
  try { db.run("ALTER TABLE purchases ADD COLUMN purchase_date TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE purchases ADD COLUMN expected_date TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE purchases ADD COLUMN received_date TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE purchases ADD COLUMN invoice_number TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE purchases ADD COLUMN payment_status TEXT DEFAULT 'pending'"); } catch (e) {}
  try { db.run("ALTER TABLE purchases ADD COLUMN payment_method TEXT DEFAULT ''"); } catch (e) {}

  // FASE 2: Inventory adjustment type
  try { db.run("ALTER TABLE inventory_movements ADD COLUMN adjustment_type TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE inventory_movements ADD COLUMN unit_cost REAL DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE inventory_movements ADD COLUMN performed_by TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE inventory_movements ADD COLUMN reason TEXT DEFAULT ''"); } catch (e) {}

  // FASE 3: Invoice enhancement - link to cash register and work orders
  try { db.run("ALTER TABLE invoices ADD COLUMN cash_register_id TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE invoices ADD COLUMN work_order_id TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE invoices ADD COLUMN payment_method TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE invoices ADD COLUMN payment_reference TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE invoices ADD COLUMN subtotal_service REAL DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE invoices ADD COLUMN subtotal_parts REAL DEFAULT 0"); } catch (e) {}

  // FASE 3: Cash register enhancements
  try { db.run("ALTER TABLE cash_register ADD COLUMN denomination_counts TEXT DEFAULT '{}'"); } catch (e) {}

  // FASE 3: Cash transaction enhancements
  try { db.run("ALTER TABLE cash_transactions ADD COLUMN customer_name TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE cash_transactions ADD COLUMN invoice_id TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE cash_transactions ADD COLUMN work_order_id TEXT"); } catch (e) {}

  // FASE 3: Direct sales (POS) table
  db.run(`CREATE TABLE IF NOT EXISTS direct_sales (
    id TEXT PRIMARY KEY, sale_number TEXT UNIQUE NOT NULL,
    customer_name TEXT DEFAULT 'Cliente general', customer_phone TEXT DEFAULT '',
    customer_email TEXT DEFAULT '', items TEXT NOT NULL,
    subtotal REAL DEFAULT 0, tax_rate REAL DEFAULT 0, tax_amount REAL DEFAULT 0,
    discount REAL DEFAULT 0, total REAL NOT NULL,
    payment_method TEXT DEFAULT 'cash', payment_reference TEXT DEFAULT '',
    cash_register_id TEXT, status TEXT DEFAULT 'completed',
    notes TEXT DEFAULT '', created_by TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);

  // FASE 2: Product images table
  db.run(`CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY, product_id TEXT NOT NULL,
    url TEXT NOT NULL, alt TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0, is_primary INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`);

  // FASE 2: Physical inventory counts
  db.run(`CREATE TABLE IF NOT EXISTS physical_inventory (
    id TEXT PRIMARY KEY, product_id TEXT NOT NULL,
    system_stock INTEGER NOT NULL, counted_stock INTEGER,
    difference INTEGER DEFAULT 0, status TEXT DEFAULT 'pending',
    notes TEXT DEFAULT '', counted_by TEXT DEFAULT '',
    counted_at TEXT, created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`);

  // CMS tables
  db.run(`CREATE TABLE IF NOT EXISTS homepage_sections (
    id TEXT PRIMARY KEY, section_key TEXT UNIQUE NOT NULL,
    title TEXT DEFAULT '', subtitle TEXT DEFAULT '',
    description TEXT DEFAULT '', image TEXT DEFAULT '',
    button_text TEXT DEFAULT '', button_link TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1,
    settings_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS navbar_config (
    id TEXT PRIMARY KEY, label TEXT NOT NULL, link TEXT NOT NULL,
    icon TEXT DEFAULT '', sort_order INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1, is_mega_menu INTEGER DEFAULT 0,
    parent_id TEXT, created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS footer_config (
    id TEXT PRIMARY KEY, column_number INTEGER DEFAULT 1,
    section_title TEXT DEFAULT '', items_json TEXT DEFAULT '[]',
    sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS seo_config (
    id TEXT PRIMARY KEY, page TEXT UNIQUE NOT NULL,
    meta_title TEXT DEFAULT '', meta_description TEXT DEFAULT '',
    keywords TEXT DEFAULT '', og_image TEXT DEFAULT '',
    og_title TEXT DEFAULT '', og_description TEXT DEFAULT '',
    canonical_url TEXT DEFAULT '', robots TEXT DEFAULT 'index, follow',
    schema_json TEXT DEFAULT '{}', updated_at TEXT DEFAULT (datetime('now'))
  )`);
  // Multimedia library tables
  db.run(`CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL,
    cloudinary_id TEXT, size INTEGER DEFAULT 0,
    width INTEGER DEFAULT 0, height INTEGER DEFAULT 0,
    mime_type TEXT DEFAULT 'image/jpeg', folder TEXT DEFAULT '/',
    tags TEXT DEFAULT '[]', alt TEXT DEFAULT '',
    usage_count INTEGER DEFAULT 0, is_trashed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS media_usages (
    id TEXT PRIMARY KEY, media_id TEXT NOT NULL,
    entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
    field_name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
  )`);

  // FASE 0: New tables for workshop flow
  db.run(`CREATE TABLE IF NOT EXISTS diagnostics (
    id TEXT PRIMARY KEY, work_order_id TEXT NOT NULL, mechanic_id TEXT,
    findings TEXT DEFAULT '', recommendations TEXT DEFAULT '',
    urgency TEXT DEFAULT 'normal', estimated_cost REAL DEFAULT 0,
    estimated_days INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY, quote_number TEXT UNIQUE NOT NULL, work_order_id TEXT NOT NULL,
    customer_id TEXT, customer_name TEXT NOT NULL, customer_email TEXT DEFAULT '',
    items TEXT DEFAULT '[]', labor_cost REAL DEFAULT 0, parts_cost REAL DEFAULT 0,
    subtotal REAL DEFAULT 0, tax_rate REAL DEFAULT 0, tax_amount REAL DEFAULT 0,
    discount REAL DEFAULT 0, total REAL DEFAULT 0, notes TEXT DEFAULT '',
    valid_until TEXT, status TEXT DEFAULT 'pending',
    approved_at TEXT, rejected_at TEXT, rejection_reason TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS work_order_parts (
    id TEXT PRIMARY KEY, work_order_id TEXT NOT NULL, product_id TEXT,
    name TEXT NOT NULL, quantity INTEGER DEFAULT 1, unit_price REAL DEFAULT 0,
    total REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS work_order_timeline (
    id TEXT PRIMARY KEY, work_order_id TEXT NOT NULL, status TEXT NOT NULL,
    description TEXT DEFAULT '', image TEXT, created_by TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, contact_name TEXT DEFAULT '',
    email TEXT DEFAULT '', phone TEXT DEFAULT '', address TEXT DEFAULT '',
    city TEXT DEFAULT '', nit TEXT DEFAULT '', notes TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS cash_register (
    id TEXT PRIMARY KEY, opening_amount REAL NOT NULL DEFAULT 0,
    closing_amount REAL, total_income REAL DEFAULT 0, total_expenses REAL DEFAULT 0,
    expected_balance REAL DEFAULT 0, actual_balance REAL, difference REAL DEFAULT 0,
    status TEXT DEFAULT 'open', opened_by TEXT, closed_by TEXT,
    opened_at TEXT DEFAULT (datetime('now')), closed_at TEXT, notes TEXT DEFAULT ''
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS cash_transactions (
    id TEXT PRIMARY KEY, cash_register_id TEXT NOT NULL, type TEXT NOT NULL,
    category TEXT NOT NULL, amount REAL NOT NULL, description TEXT DEFAULT '',
    reference_type TEXT, reference_id TEXT, payment_method TEXT DEFAULT 'cash',
    created_by TEXT, created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, user_id TEXT, customer_id TEXT, type TEXT NOT NULL,
    title TEXT NOT NULL, message TEXT DEFAULT '', entity_type TEXT,
    entity_id TEXT, is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // New feature tables: appointments, mechanics, timeline, invoices, warranties
  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY, customer_id TEXT, customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL, customer_email TEXT DEFAULT '',
    service_type TEXT DEFAULT '', mechanic_id TEXT,
    appointment_date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL,
    status TEXT DEFAULT 'pending', notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (mechanic_id) REFERENCES team_members(id) ON DELETE SET NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS mechanic_availability (
    id TEXT PRIMARY KEY, mechanic_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL, start_time TEXT NOT NULL,
    end_time TEXT NOT NULL, is_available INTEGER DEFAULT 1,
    FOREIGN KEY (mechanic_id) REFERENCES team_members(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS holidays (
    id TEXT PRIMARY KEY, date TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL, type TEXT DEFAULT 'holiday',
    applies_to TEXT DEFAULT 'all', mechanic_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (mechanic_id) REFERENCES team_members(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS order_timeline (
    id TEXT PRIMARY KEY, order_id TEXT NOT NULL,
    status TEXT NOT NULL, description TEXT DEFAULT '',
    image TEXT, created_by TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY, order_id TEXT NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL, customer_id TEXT,
    customer_name TEXT NOT NULL, customer_email TEXT NOT NULL,
    customer_phone TEXT DEFAULT '', customer_nit TEXT DEFAULT '',
    items TEXT NOT NULL, subtotal REAL NOT NULL DEFAULT 0,
    tax_name TEXT DEFAULT 'IVA', tax_rate REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0, discount REAL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0, status TEXT DEFAULT 'pending',
    notes TEXT DEFAULT '', pdf_url TEXT DEFAULT '',
    due_date TEXT, paid_at TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS warranties (
    id TEXT PRIMARY KEY, entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL, customer_id TEXT, customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL, customer_phone TEXT DEFAULT '',
    service_name TEXT DEFAULT '', product_name TEXT DEFAULT '',
    duration_days INTEGER NOT NULL DEFAULT 15,
    start_date TEXT NOT NULL, end_date TEXT NOT NULL,
    terms TEXT DEFAULT '', status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);

  // Add warranty_period and appointment fields to site_config defaults
  try { db.run("ALTER TABLE site_config ADD COLUMN default_warranty_days INTEGER DEFAULT 15"); } catch (e) {}
  try { db.run("ALTER TABLE site_config ADD COLUMN appointment_interval_minutes INTEGER DEFAULT 60"); } catch (e) {}
  try { db.run("ALTER TABLE site_config ADD COLUMN working_hours_start TEXT DEFAULT '09:00'"); } catch (e) {}
  try { db.run("ALTER TABLE site_config ADD COLUMN working_hours_end TEXT DEFAULT '18:00'"); } catch (e) {}
  try { db.run("ALTER TABLE site_config ADD COLUMN daily_capacity INTEGER DEFAULT 10"); } catch (e) {}
  try { db.run("ALTER TABLE site_config ADD COLUMN service_durations TEXT DEFAULT '{}'"); } catch (e) {}
  try { db.run("ALTER TABLE site_config ADD COLUMN break_start TEXT DEFAULT '12:00'"); } catch (e) {}
  try { db.run("ALTER TABLE site_config ADD COLUMN break_end TEXT DEFAULT '13:00'"); } catch (e) {}

  // Promociones: type (product/service/combo/campaign) + expiry for countdowns
  try { db.run("ALTER TABLE offer_slides ADD COLUMN promo_type TEXT DEFAULT 'campaign'"); } catch (e) {}
  try { db.run("ALTER TABLE offer_slides ADD COLUMN ends_at TEXT"); } catch (e) {}
  // Promociones: master switch (admin controls visibility on the site)
  try { db.run("INSERT OR IGNORE INTO site_config (key, value) VALUES ('promotions_enabled', '0')"); } catch (e) {}

  // Workshop flow: reception, QC, delivery, warranty columns
  try { db.run("ALTER TABLE work_orders ADD COLUMN reception_photos TEXT DEFAULT '[]'"); } catch (e) {}
  try { db.run("ALTER TABLE work_orders ADD COLUMN reception_observations TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE work_orders ADD COLUMN reception_mileage INTEGER DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE work_orders ADD COLUMN delivery_signature TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE work_orders ADD COLUMN delivery_notes TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE work_orders ADD COLUMN warranty_days INTEGER DEFAULT 15"); } catch (e) {}
  try { db.run("ALTER TABLE work_orders ADD COLUMN warranty_notes TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE work_orders ADD COLUMN qc_checklist TEXT DEFAULT '[]'"); } catch (e) {}
  try { db.run("ALTER TABLE work_orders ADD COLUMN qc_completed_by TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE work_orders ADD COLUMN qc_completed_at TEXT"); } catch (e) {}

  db.run(`CREATE TABLE IF NOT EXISTS work_order_photos (
    id TEXT PRIMARY KEY, work_order_id TEXT NOT NULL,
    url TEXT NOT NULL, caption TEXT DEFAULT '',
    category TEXT DEFAULT 'reception',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS work_order_checklist (
    id TEXT PRIMARY KEY, work_order_id TEXT NOT NULL,
    item TEXT NOT NULL, checked INTEGER DEFAULT 0,
    checked_by TEXT DEFAULT '', checked_at TEXT,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
  )`);


  // Satisfaction surveys
  db.run(`CREATE TABLE IF NOT EXISTS satisfaction_surveys (
    id TEXT PRIMARY KEY, survey_id TEXT UNIQUE NOT NULL,
    work_order_id TEXT NOT NULL, rating INTEGER NOT NULL,
    comment TEXT DEFAULT '', categories TEXT DEFAULT '[]',
    would_recommend INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
  )`);

  // Branches
  db.run(`CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    address TEXT DEFAULT '', phone TEXT DEFAULT '',
    email TEXT DEFAULT '', schedule TEXT DEFAULT '',
    is_main INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);

  // WhatsApp message history
  db.run(`CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY, customer_id TEXT,
    phone TEXT NOT NULL, direction TEXT DEFAULT 'outbound',
    message TEXT NOT NULL, template_name TEXT,
    status TEXT DEFAULT 'sent', error TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Email send log
  db.run(`CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY, customer_id TEXT,
    email TEXT NOT NULL, subject TEXT NOT NULL,
    template_name TEXT, status TEXT DEFAULT 'sent',
    error TEXT, created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Scheduled reminders log
  db.run(`CREATE TABLE IF NOT EXISTS reminder_logs (
    id TEXT PRIMARY KEY, type TEXT NOT NULL,
    entity_id TEXT, customer_id TEXT,
    channel TEXT DEFAULT 'email', sent_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'sent'
  )`);

  // Blog comments table
  db.run(`CREATE TABLE IF NOT EXISTS blog_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    is_approved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
  )`);

  // Surveys additional columns on work_orders
  try { db.run("ALTER TABLE work_orders ADD COLUMN survey_sent TEXT"); } catch (e) {}

  // Vehicles additional columns for maintenance tracking
  try { db.run("ALTER TABLE vehicles ADD COLUMN last_service_date TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE vehicles ADD COLUMN last_oil_change TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE vehicles ADD COLUMN notes TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE vehicles ADD COLUMN customer_id TEXT"); } catch (e) {}

  // Services icon_type migration
  try { db.run("ALTER TABLE services ADD COLUMN icon_type TEXT DEFAULT 'lucide'"); } catch (e) {}
  try { db.run("ALTER TABLE services ADD COLUMN duration TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE services ADD COLUMN accent TEXT DEFAULT '#F59E0B'"); } catch (e) {}


  db.run(`CREATE TABLE IF NOT EXISTS loyalty_points (
    id TEXT PRIMARY KEY, customer_id TEXT NOT NULL UNIQUE,
    balance INTEGER DEFAULT 0, total_earned INTEGER DEFAULT 0,
    total_redeemed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS loyalty_history (
    id TEXT PRIMARY KEY, customer_id TEXT NOT NULL,
    points INTEGER NOT NULL, type TEXT NOT NULL,
    description TEXT DEFAULT '', entity_id TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )`);

  // Google Calendar config columns
  try { db.run("ALTER TABLE site_config ADD COLUMN google_calendar_enabled TEXT DEFAULT 'false'"); } catch (e) {}
  try { db.run("ALTER TABLE site_config ADD COLUMN google_calendar_id TEXT DEFAULT 'primary'"); } catch (e) {}
  try { db.run("ALTER TABLE site_config ADD COLUMN google_calendar_service_account TEXT DEFAULT ''"); } catch (e) {}

  // Brands: add missing columns
  try { db.run("ALTER TABLE brands ADD COLUMN alt_image TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE brands ADD COLUMN accent TEXT DEFAULT ''"); } catch (e) {}
  try { db.run("ALTER TABLE brands ADD COLUMN is_active INTEGER DEFAULT 1"); } catch (e) {}
  try { db.run("ALTER TABLE brands ADD COLUMN is_visible_store INTEGER DEFAULT 1"); } catch (e) {}

  // Services: add category column
  try { db.run("ALTER TABLE services ADD COLUMN category TEXT DEFAULT ''"); } catch (e) {}

  // Gallery: add category column
  try { db.run("ALTER TABLE gallery_images ADD COLUMN category TEXT DEFAULT 'fotos'"); } catch (e) {}

  // Seed default service categories
  const existingCats = db.exec("SELECT COUNT(*) as c FROM service_categories");
  if (!existingCats.length || !existingCats[0].values.length || existingCats[0].values[0][0] === 0) {
    const defaultCats = ["Mecánica", "Eléctrica", "Suspensión", "Frenos", "Motor", "Llantas", "Diagnóstico", "Mantenimiento"];
    const { generateId, slugify } = require("../utils/helpers");
    defaultCats.forEach((name, i) => {
      const id = generateId();
      const slug = slugify(name);
      try { run("INSERT INTO service_categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)", [id, name, slug, i + 1]); } catch (e) {}
    });
  }

  // Warehouses table
  db.run(`CREATE TABLE IF NOT EXISTS warehouses (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    address TEXT DEFAULT '', phone TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  // Seed default warehouse
  const whCount = get("SELECT COUNT(*) as c FROM warehouses");
  if (whCount && whCount.c === 0) {
    run("INSERT INTO warehouses (id, name, is_active) VALUES ('main', 'Almacén Principal', 1)");
  }

  // Insert default config if not exists
  const existing = db.exec("SELECT COUNT(*) as count FROM site_config");
  if (!existing.length || !existing[0].values.length || existing[0].values[0][0] === 0) {
    const configs = [
      ["site_name", "MotoPro Taller"], ["site_description", "Taller especializado en mantenimiento, reparación y personalización de motocicletas."],
      ["site_slogan", "Tu moto en las mejores manos"], ["site_email", "info@motopro.com"],
      ["site_phone", "+52 555 123 4567"], ["site_address", "Av. Revolución 1234, Col. Centro, CDMX"],
      ["site_hours", "Lun - Vie: 8:00 - 18:00 | Sáb: 8:00 - 14:00"],
      ["site_logo", ""], ["site_favicon", ""],
      ["social_facebook", "#"], ["social_instagram", "#"], ["social_tiktok", "#"], ["social_youtube", "#"], ["social_whatsapp", "525551234567"],
      ["site_type", "taller"], ["site_currency", "USD"], ["site_accent", "#0D9488"], ["site_url", ""],
      ["tax_name", "IVA"], ["tax_rate", "16"],
    ];
    const stmt = db.prepare("INSERT OR IGNORE INTO site_config (key, value) VALUES (?, ?)");
    configs.forEach(([k, v]) => stmt.run([k, v]));
  }

  // Seed homepage sections
  const { seedHomepageSections } = require('../services/cms.service');
  seedHomepageSections();

  // Seed stats section settings_json if empty
  try {
    const statsSection = get("SELECT id, settings_json FROM homepage_sections WHERE section_key = 'stats'");
    if (statsSection && (!statsSection.settings_json || statsSection.settings_json === '{}')) {
      const statsSettings = JSON.stringify({ motos: "1,250", marcas: "13", rating: "4.9" });
      run("UPDATE homepage_sections SET settings_json = ? WHERE section_key = 'stats'", [statsSettings]);
    }
  } catch (e) {}

  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (sql.trim().toUpperCase().startsWith("SELECT") || sql.trim().toUpperCase().startsWith("WITH")) {
    const rows = [];
    stmt.bind(params);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push(row);
    }
    stmt.free();
    return rows;
  } else {
    const result = stmt.run(params);
    stmt.free();
    saveDb();
    return result;
  }
}

function get(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
  return query(sql, params);
}

function exec(sql) {
  db.run(sql);
  saveDb();
}

module.exports = { initDatabase, getDb, query, get, run, exec, saveDb, db };
