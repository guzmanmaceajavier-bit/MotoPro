const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { all } = req.query;
  let sql = "SELECT * FROM certifications";
  if (all !== "1") sql += " WHERE is_active = 1";
  sql += " ORDER BY sort_order";
  success(res, query(sql));
};

exports.getById = (req, res) => {
  const item = get("SELECT * FROM certifications WHERE id = ?", [req.params.id]);
  if (!item) return error(res, "No encontrado", 404);
  success(res, item);
};

exports.create = (req, res) => {
  const { title, issuer, image, description } = req.body;
  if (!title) return error(res, "Título requerido", 400);
  const id = generateId();
  run("INSERT INTO certifications (id, title, issuer, image, description) VALUES (?, ?, ?, ?, ?)",
    [id, title, issuer || "", image || null, description || ""]);
  success(res, { id }, "Creado", 201);
};

exports.update = (req, res) => {
  const { title, issuer, image, description, sort_order, is_active } = req.body;
  const existing = get("SELECT id FROM certifications WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "No encontrado", 404);
  run("UPDATE certifications SET title = COALESCE(?, title), issuer = COALESCE(?, issuer), image = COALESCE(?, image), description = COALESCE(?, description), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
    [title || null, issuer || null, image || null, description || null, sort_order != null ? sort_order : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM certifications WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "No encontrado", 404);
  run("DELETE FROM certifications WHERE id = ?", [req.params.id]);
  success(res, null, "Eliminado");
};
