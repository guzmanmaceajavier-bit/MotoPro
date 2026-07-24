const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { status, supplier_id, search, page, limit } = req.query;
  let sql = `SELECT p.*, s.name as supplier_name FROM purchases p
    LEFT JOIN suppliers s ON p.supplier_id = s.id`;
  const conditions = [];
  const params = [];
  if (status) { conditions.push("p.status = ?"); params.push(status); }
  if (supplier_id) { conditions.push("p.supplier_id = ?"); params.push(supplier_id); }
  if (search) { conditions.push("(p.supplier LIKE ? OR p.invoice_number LIKE ? OR s.name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY p.created_at DESC";
  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = get(`SELECT COUNT(*) as total FROM purchases p LEFT JOIN suppliers s ON p.supplier_id = s.id${conditions.length ? " WHERE " + conditions.join(" AND") : ""}`, params);
    const total = countRow?.total || 0;
    const data = query(`${sql} LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }
  success(res, query(sql, params));
};

exports.getById = (req, res) => {
  const purchase = get(`SELECT p.*, s.name as supplier_name, s.phone as supplier_phone, s.email as supplier_email
    FROM purchases p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?`, [req.params.id]);
  if (!purchase) return error(res, "Compra no encontrada", 404);
  purchase.items = JSON.parse(purchase.items || "[]");
  success(res, purchase);
};

exports.create = (req, res) => {
  const {
    supplier, supplier_id, items, total, notes,
    purchase_date, expected_date, invoice_number, payment_method
  } = req.body;
  if (!items || !items.length) return error(res, "Items requeridos", 400);
  const id = generateId();
  const computedTotal = total || items.reduce((s, i) => s + (i.quantity * i.unit_cost), 0);
  run(`INSERT INTO purchases (id, supplier, supplier_id, items, total, notes, status,
    purchase_date, expected_date, invoice_number, payment_method, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, 'pending')`,
    [id, supplier || "", supplier_id || null, JSON.stringify(items), computedTotal, notes || "",
     purchase_date || new Date().toISOString().split("T")[0], expected_date || null,
     invoice_number || "", payment_method || ""]);
  success(res, { id }, "Compra creada", 201);
};

exports.update = (req, res) => {
  const {
    supplier, supplier_id, items, total, status, notes,
    purchase_date, expected_date, received_date, invoice_number,
    payment_status, payment_method
  } = req.body;
  const existing = get("SELECT id FROM purchases WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Compra no encontrada", 404);
  run(`UPDATE purchases SET
    supplier = COALESCE(?, supplier), supplier_id = ?,
    items = COALESCE(?, items), total = COALESCE(?, total),
    status = COALESCE(?, status), notes = COALESCE(?, notes),
    purchase_date = COALESCE(?, purchase_date), expected_date = COALESCE(?, expected_date),
    received_date = COALESCE(?, received_date), invoice_number = COALESCE(?, invoice_number),
    payment_status = COALESCE(?, payment_status), payment_method = COALESCE(?, payment_method),
    updated_at = datetime('now') WHERE id = ?`,
    [supplier || null, supplier_id || null, items ? JSON.stringify(items) : null,
     total != null ? total : null, status || null, notes || null,
     purchase_date || null, expected_date || null, received_date || null,
     invoice_number || null, payment_status || null, payment_method || null, req.params.id]);
  success(res, null, "Compra actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM purchases WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Compra no encontrada", 404);
  run("DELETE FROM purchases WHERE id = ?", [req.params.id]);
  success(res, null, "Compra eliminada");
};

// Receive purchase - update stock for each item
exports.receive = (req, res) => {
  const purchase = get("SELECT * FROM purchases WHERE id = ?", [req.params.id]);
  if (!purchase) return error(res, "Compra no encontrada", 404);
  if (purchase.status === "received") return error(res, "La compra ya fue recibida", 400);

  const items = JSON.parse(purchase.items || "[]");
  items.forEach(item => {
    if (item.product_id) {
      const product = get("SELECT id, stock FROM products WHERE id = ?", [item.product_id]);
      if (product) {
        const newStock = product.stock + (item.quantity || 0);
        run("UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?", [newStock, item.product_id]);
        run(`INSERT INTO inventory_movements (id, product_id, type, quantity, reference, notes, unit_cost, performed_by)
          VALUES (?, ?, 'in', ?, ?, ?, ?, ?)`,
          [generateId(), item.product_id, item.quantity || 0, `compra_${purchase.id}`,
           `Compra ${purchase.invoice_number || purchase.id}`, item.unit_cost || 0, req.user?.name || "system"]);
      }
    }
  });

  run("UPDATE purchases SET status = 'received', received_date = datetime('now'), updated_at = datetime('now') WHERE id = ?",
    [req.params.id]);
  success(res, null, "Compra recibida y stock actualizado");
};

exports.getStats = (req, res) => {
  const total = get("SELECT COUNT(*) as c FROM purchases");
  const pending = get("SELECT COUNT(*) as c FROM purchases WHERE status = 'pending'");
  const received = get("SELECT COUNT(*) as c FROM purchases WHERE status = 'received'");
  const totalSpent = get("SELECT COALESCE(SUM(total), 0) as t FROM purchases WHERE status = 'received'");
  const thisMonth = get("SELECT COALESCE(SUM(total), 0) as t FROM purchases WHERE status = 'received' AND created_at >= date('now', 'start of month')");
  success(res, {
    total: total?.c || 0, pending: pending?.c || 0, received: received?.c || 0,
    totalSpent: totalSpent?.t || 0, thisMonth: thisMonth?.t || 0
  });
};
