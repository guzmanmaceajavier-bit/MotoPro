const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { product_id, type, performed_by, date_from, date_to, search, page, limit = 50 } = req.query;
  let sql = `SELECT im.*, p.name as product_name, p.sku as product_sku
    FROM inventory_movements im LEFT JOIN products p ON im.product_id = p.id`;
  const conditions = [];
  const params = [];
  if (product_id) { conditions.push("im.product_id = ?"); params.push(product_id); }
  if (type) { conditions.push("im.type = ?"); params.push(type); }
  if (performed_by) { conditions.push("im.performed_by LIKE ?"); params.push(`%${performed_by}%`); }
  if (date_from) { conditions.push("im.created_at >= ?"); params.push(date_from); }
  if (date_to) { conditions.push("im.created_at <= ?"); params.push(date_to + " 23:59:59"); }
  if (search) { conditions.push("(p.name LIKE ? OR im.reference LIKE ? OR im.notes LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY im.created_at DESC";
  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    const countRow = get(`SELECT COUNT(*) as total FROM inventory_movements im LEFT JOIN products p ON im.product_id = p.id${conditions.length ? " WHERE " + conditions.join(" AND") : ""}`, params);
    const total = countRow?.total || 0;
    const data = query(`${sql} LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }
  success(res, query(sql, params));
};

exports.getById = (req, res) => {
  const movement = get(`SELECT im.*, p.name as product_name, p.sku as product_sku
    FROM inventory_movements im LEFT JOIN products p ON im.product_id = p.id WHERE im.id = ?`, [req.params.id]);
  if (!movement) return error(res, "Movimiento no encontrado", 404);
  success(res, movement);
};

exports.create = (req, res) => {
  const { product_id, type, quantity, reference, notes, unit_cost, adjustment_type, reason } = req.body;
  if (!product_id || !type || !quantity) return error(res, "Producto, tipo y cantidad requeridos", 400);
  const product = get("SELECT id, stock, name FROM products WHERE id = ?", [product_id]);
  if (!product) return error(res, "Producto no encontrado", 404);
  if (type === "out" && product.stock < quantity) return error(res, "Stock insuficiente", 400);
  const id = generateId();
  run(`INSERT INTO inventory_movements (id, product_id, type, quantity, reference, notes, unit_cost, performed_by, adjustment_type, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, product_id, type, quantity, reference || "", notes || "",
     parseFloat(unit_cost) || 0, req.user?.name || "system", adjustment_type || "", reason || ""]);
  const sign = type === "in" ? 1 : -1;
  run("UPDATE products SET stock = stock + ?, updated_at = datetime('now') WHERE id = ?", [sign * quantity, product_id]);
  success(res, { id }, "Movimiento registrado", 201);
};

exports.getStockAlerts = (req, res) => {
  const lowStock = query(`SELECT p.*, c.name as category_name, b.name as brand_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = 1 AND p.stock > 0 AND p.stock <= p.min_stock
    ORDER BY p.stock ASC`);
  const outOfStock = query(`SELECT p.*, c.name as category_name, b.name as brand_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = 1 AND p.stock <= 0`);
  const overStock = query(`SELECT p.*, c.name as category_name, b.name as brand_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = 1 AND p.max_stock > 0 AND p.stock > p.max_stock`);
  const needReorder = query(`SELECT p.*, c.name as category_name, sup.name as supplier_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers sup ON p.supplier_id = sup.id
    WHERE p.is_active = 1 AND p.reorder_point > 0 AND p.stock <= p.reorder_point`);
  success(res, { lowStock, outOfStock, overStock, needReorder });
};

exports.getSummary = (req, res) => {
  const totalProducts = get("SELECT COUNT(*) as c FROM products WHERE is_active = 1");
  const totalValue = get("SELECT COALESCE(SUM(stock * purchase_price), 0) as v FROM products WHERE is_active = 1");
  const totalMovements = get("SELECT COUNT(*) as c FROM inventory_movements WHERE created_at >= date('now', 'start of month')");
  const inThisMonth = get("SELECT COALESCE(SUM(quantity), 0) as q FROM inventory_movements WHERE type = 'in' AND created_at >= date('now', 'start of month')");
  const outThisMonth = get("SELECT COALESCE(SUM(quantity), 0) as q FROM inventory_movements WHERE type = 'out' AND created_at >= date('now', 'start of month')");
  success(res, {
    totalProducts: totalProducts?.c || 0,
    totalValue: totalValue?.v || 0,
    movementsThisMonth: totalMovements?.c || 0,
    inThisMonth: inThisMonth?.q || 0,
    outThisMonth: outThisMonth?.q || 0,
  });
};
