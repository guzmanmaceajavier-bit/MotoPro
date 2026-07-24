const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { all } = req.query;
  let sql = "SELECT * FROM company_values";
  if (all !== "1") sql += " WHERE is_active = 1";
  sql += " ORDER BY sort_order";
  success(res, query(sql));
};

exports.getById = (req, res) => {
  const value = get("SELECT * FROM company_values WHERE id = ?", [req.params.id]);
  if (!value) return error(res, "Valor no encontrado", 404);
  success(res, value);
};

exports.create = (req, res) => {
  const { title, description, icon, image } = req.body;
  if (!title) return error(res, "Título requerido", 400);
  const id = generateId();
  run("INSERT INTO company_values (id, title, description, icon, image) VALUES (?, ?, ?, ?, ?)",
    [id, title, description || "", icon || "heart", image || null]);
  success(res, { id }, "Valor creado", 201);
};

exports.update = (req, res) => {
  const { title, description, icon, image, sort_order, is_active } = req.body;
  const existing = get("SELECT id FROM company_values WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Valor no encontrado", 404);
  run("UPDATE company_values SET title = COALESCE(?, title), description = COALESCE(?, description), icon = COALESCE(?, icon), image = COALESCE(?, image), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
    [title || null, description || null, icon || null, image || null, sort_order != null ? sort_order : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Valor actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM company_values WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Valor no encontrado", 404);
  run("DELETE FROM company_values WHERE id = ?", [req.params.id]);
  success(res, null, "Valor eliminado");
};