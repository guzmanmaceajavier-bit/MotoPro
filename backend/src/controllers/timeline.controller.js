const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { order_id } = req.query;
  if (!order_id) return error(res, "order_id es requerido", 400);
  const entries = query("SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC", [order_id]);
  success(res, entries);
};

exports.create = (req, res) => {
  const { order_id, status, description, created_by } = req.body;
  if (!order_id || !status) return error(res, "order_id y status son requeridos", 400);
  const id = generateId();
  run(`INSERT INTO order_timeline (id, order_id, status, description, image, created_by)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [id, order_id, status, description || "", req.file ? `/uploads/${req.file.filename}` : "", created_by || ""]);
  success(res, { id }, "Entrada de timeline creada", 201);
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM order_timeline WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Entrada de timeline no encontrada", 404);
  run("DELETE FROM order_timeline WHERE id = ?", [req.params.id]);
  success(res, null, "Entrada de timeline eliminada");
};
