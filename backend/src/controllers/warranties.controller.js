const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { status, customer_id, entity_id, page, limit } = req.query;
  let sql = "SELECT * FROM warranties";
  const conditions = [];
  const params = [];
  if (status) { conditions.push("status = ?"); params.push(status); }
  if (customer_id) { conditions.push("customer_id = ?"); params.push(customer_id); }
  if (entity_id) { conditions.push("entity_id = ?"); params.push(entity_id); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY created_at DESC";
  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = query(`SELECT COUNT(*) as total FROM warranties${conditions.length ? " WHERE " + conditions.join(" AND ") : ""}`, params);
    const total = countRow[0]?.total || 0;
    const data = query(`${sql} LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }
  const data = query(sql, params);
  success(res, data);
};

exports.getById = (req, res) => {
  const warranty = get("SELECT * FROM warranties WHERE id = ?", [req.params.id]);
  if (!warranty) return error(res, "Garantía no encontrada", 404);
  success(res, warranty);
};

exports.getByCustomer = (req, res) => {
  const warranties = query("SELECT * FROM warranties WHERE customer_id = ? ORDER BY created_at DESC", [req.params.customer_id]);
  success(res, warranties);
};

exports.create = (req, res) => {
  const { entity_type, entity_id, customer_id, customer_name, customer_email, customer_phone, service_name, product_name, duration_days, start_date, terms } = req.body;
  if (!entity_type || !entity_id || !customer_name || !customer_email) {
    return error(res, "entity_type, entity_id, customer_name y customer_email son requeridos", 400);
  }
  const days = parseInt(duration_days) || 15;
  const start = start_date || new Date().toISOString().split("T")[0];
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + days);
  const end = endDate.toISOString().split("T")[0];
  const id = generateId();
  run(`INSERT INTO warranties (id, entity_type, entity_id, customer_id, customer_name, customer_email, customer_phone, service_name, product_name, duration_days, start_date, end_date, terms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, entity_type, entity_id, customer_id || null, customer_name, customer_email, customer_phone || "",
      service_name || "", product_name || "", days, start, end, terms || ""]);
  success(res, { id }, "Garantía creada", 201);
};

exports.update = (req, res) => {
  const { customer_name, customer_email, customer_phone, service_name, product_name, duration_days, start_date, end_date, terms, status } = req.body;
  const existing = get("SELECT id FROM warranties WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Garantía no encontrada", 404);
  run(`UPDATE warranties SET
    customer_name = COALESCE(?, customer_name), customer_email = COALESCE(?, customer_email),
    customer_phone = COALESCE(?, customer_phone), service_name = COALESCE(?, service_name),
    product_name = COALESCE(?, product_name), duration_days = COALESCE(?, duration_days),
    start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date),
    terms = COALESCE(?, terms), status = COALESCE(?, status),
    updated_at = datetime('now') WHERE id = ?`,
    [customer_name || null, customer_email || null, customer_phone || null, service_name || null,
      product_name || null, duration_days != null ? parseInt(duration_days) : null,
      start_date || null, end_date || null, terms || null, status || null, req.params.id]);
  success(res, null, "Garantía actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM warranties WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Garantía no encontrada", 404);
  run("DELETE FROM warranties WHERE id = ?", [req.params.id]);
  success(res, null, "Garantía eliminada");
};
