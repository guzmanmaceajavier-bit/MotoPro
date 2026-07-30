const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { all, page } = req.query;
  let sql = "SELECT * FROM trust_items";
  const params = [];
  const conditions = [];
  if (all !== "1") conditions.push("is_active = 1");
  if (page) conditions.push("page = ?"), params.push(page);
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY sort_order";
  success(res, query(sql, params));
};

exports.getById = (req, res) => {
  const item = get("SELECT * FROM trust_items WHERE id = ?", [req.params.id]);
  if (!item) return error(res, "No encontrado", 404);
  success(res, item);
};

exports.create = (req, res) => {
  const { title, description, icon, page } = req.body;
  if (!title) return error(res, "Título requerido", 400);
  const id = generateId();
  run("INSERT INTO trust_items (id, title, description, icon, page) VALUES (?, ?, ?, ?, ?)",
    [id, title, description || "", icon || "shield", page || ""]);
  success(res, { id }, "Creado", 201);
};

exports.update = (req, res) => {
  const { title, description, icon, page, sort_order, is_active } = req.body;
  const existing = get("SELECT id FROM trust_items WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "No encontrado", 404);
  run("UPDATE trust_items SET title = COALESCE(?, title), description = COALESCE(?, description), icon = COALESCE(?, icon), page = COALESCE(?, page), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
    [title || null, description || null, icon || null, page || null, sort_order != null ? sort_order : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM trust_items WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "No encontrado", 404);
  run("DELETE FROM trust_items WHERE id = ?", [req.params.id]);
  success(res, null, "Eliminado");
};
