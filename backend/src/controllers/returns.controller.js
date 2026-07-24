const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { status } = req.query;
  let sql = "SELECT * FROM returns";
  const params = [];
  if (status) { sql += " WHERE status = ?"; params.push(status); }
  sql += " ORDER BY created_at DESC";
  success(res, query(sql, params));
};

exports.getById = (req, res) => {
  const ret = get("SELECT * FROM returns WHERE id = ?", [req.params.id]);
  if (!ret) return error(res, "Devolución no encontrada", 404);
  success(res, ret);
};

exports.create = (req, res) => {
  const { order_id, customer_name, customer_email, reason, items, refund_amount } = req.body;
  if (!order_id || !customer_name || !customer_email) return error(res, "Orden, nombre y email requeridos", 400);
  const id = generateId();
  run("INSERT INTO returns (id, order_id, customer_name, customer_email, reason, items, refund_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, order_id, customer_name, customer_email, reason || "", JSON.stringify(items || []), refund_amount || 0]);
  success(res, { id }, "Devolución creada", 201);
};

exports.update = (req, res) => {
  const { status, refund_amount } = req.body;
  const existing = get("SELECT id FROM returns WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Devolución no encontrada", 404);
  run("UPDATE returns SET status = COALESCE(?, status), refund_amount = COALESCE(?, refund_amount), updated_at = datetime('now') WHERE id = ?",
    [status || null, refund_amount != null ? refund_amount : null, req.params.id]);
  success(res, null, "Devolución actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM returns WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Devolución no encontrada", 404);
  run("DELETE FROM returns WHERE id = ?", [req.params.id]);
  success(res, null, "Devolución eliminada");
};