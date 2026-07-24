const { query, run, exec, saveDb } = require("../config/database");
const { success, error } = require("../utils/helpers");

exports.getAll = (req, res) => {
  const rows = query("SELECT key, value FROM site_config");
  const config = {};
  rows.forEach(r => { config[r.key] = r.value; });
  success(res, config);
};

exports.update = (req, res) => {
  const entries = req.body;
  if (!entries || typeof entries !== "object") return error(res, "Se requiere un objeto con key: value", 400);
  for (const [key, value] of Object.entries(entries)) {
    run("INSERT OR REPLACE INTO site_config (key, value, updated_at) VALUES (?, ?, datetime('now'))", [key, String(value)]);
  }
  success(res, null, "Configuración actualizada");
};

exports.stats = (req, res) => {
  const products = query("SELECT COUNT(*) as c FROM products")[0]?.c || 0;
  const categories = query("SELECT COUNT(*) as c FROM categories")[0]?.c || 0;
  const brands = query("SELECT COUNT(*) as c FROM brands")[0]?.c || 0;
  const services = query("SELECT COUNT(*) as c FROM services")[0]?.c || 0;
  const blog = query("SELECT COUNT(*) as c FROM blog_posts")[0]?.c || 0;
  const gallery = query("SELECT COUNT(*) as c FROM gallery_images")[0]?.c || 0;
  const testimonials = query("SELECT COUNT(*) as c FROM testimonials")[0]?.c || 0;
  const contacts = query("SELECT COUNT(*) as c FROM contacts")[0]?.c || 0;
  const customers = query("SELECT COUNT(*) as c FROM customers")[0]?.c || 0;
  const workOrders = query("SELECT COUNT(*) as c FROM work_orders")[0]?.c || 0;
  const storeOrders = query("SELECT COUNT(*) as c FROM store_orders")[0]?.c || 0;
  const totalRevenue = query("SELECT COALESCE(SUM(total),0) as c FROM store_orders")[0]?.c || 0;
  success(res, {
    products, categories, brands, services, blog, gallery,
    testimonials, contacts, customers, workOrders, storeOrders,
    totalRevenue, pendingOrders: query("SELECT COUNT(*) as c FROM store_orders WHERE status = 'pending'")[0]?.c || 0,
    recentOrders: query("SELECT id, customer_name, total, status, created_at FROM store_orders ORDER BY created_at DESC LIMIT 5"),
    recentWorkOrders: query("SELECT id, customer_name, status, order_number, created_at FROM work_orders ORDER BY created_at DESC LIMIT 5"),
  });
};

exports.format = (req, res) => {
  const tables = [
    "products", "categories", "subcategories", "brands", "services", "blog_posts",
    "gallery_images", "testimonials", "team_members", "contacts", "work_orders",
    "hero_slides", "cart_items", "store_orders", "offer_slides", "faqs", "reviews",
    "company_values", "activity_logs", "returns", "purchases", "shipping_zones",
    "payment_methods", "email_config", "legal_pages", "inventory_movements", "coupons",
    "customers", "before_after", "blog_categories",
  ];
  try {
    tables.forEach((t) => run(`DELETE FROM ${t}`));
    run("DELETE FROM site_config WHERE key NOT IN ('site_accent')");
    success(res, null, "Sistema formateado correctamente");
  } catch (err) {
    error(res, "Error al formatear: " + err.message, 500);
  }
};
