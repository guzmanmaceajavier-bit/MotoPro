const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { all } = req.query;
  let sql = "SELECT * FROM process_steps";
  if (all !== "1") sql += " WHERE is_active = 1";
  sql += " ORDER BY sort_order";
  success(res, query(sql));
};

exports.getById = (req, res) => {
  const item = get("SELECT * FROM process_steps WHERE id = ?", [req.params.id]);
  if (!item) return error(res, "No encontrado", 404);
  success(res, item);
};

exports.create = (req, res) => {
  const { title, description, icon, color } = req.body;
  if (!title) return error(res, "Título requerido", 400);
  const id = generateId();
  run("INSERT INTO process_steps (id, title, description, icon, color) VALUES (?, ?, ?, ?, ?)",
    [id, title, description || "", icon || "settings", color || "#FF6B00"]);
  success(res, { id }, "Creado", 201);
};

exports.update = (req, res) => {
  const { title, description, icon, color, sort_order, is_active } = req.body;
  const existing = get("SELECT id FROM process_steps WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "No encontrado", 404);
  run("UPDATE process_steps SET title = COALESCE(?, title), description = COALESCE(?, description), icon = COALESCE(?, icon), color = COALESCE(?, color), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
    [title || null, description || null, icon || null, color || null, sort_order != null ? sort_order : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM process_steps WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "No encontrado", 404);
  run("DELETE FROM process_steps WHERE id = ?", [req.params.id]);
  success(res, null, "Eliminado");
};
