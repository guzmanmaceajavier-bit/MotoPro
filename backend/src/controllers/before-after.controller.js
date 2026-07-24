const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { destroyImage } = require("../utils/cloudinary");

exports.list = (req, res) => {
  const { all } = req.query;
  let sql = "SELECT * FROM before_after";
  if (all !== "1") sql += " WHERE is_active = 1";
  sql += " ORDER BY sort_order";
  success(res, query(sql));
};

exports.getById = (req, res) => {
  const item = get("SELECT * FROM before_after WHERE id = ?", [req.params.id]);
  if (!item) return error(res, "Comparación no encontrada", 404);
  success(res, item);
};

exports.create = (req, res) => {
  const { title, before_image, after_image, description } = req.body;
  if (!title || !before_image || !after_image) return error(res, "Título e imágenes requeridos", 400);
  const id = generateId();
  run("INSERT INTO before_after (id, title, before_image, after_image, description) VALUES (?, ?, ?, ?, ?)",
    [id, title, before_image, after_image, description || ""]);
  success(res, { id }, "Comparación creada", 201);
};

exports.update = (req, res) => {
  const { title, before_image, after_image, description, sort_order, is_active } = req.body;
  const existing = get("SELECT id, before_image, after_image FROM before_after WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Comparación no encontrada", 404);
  if (before_image && before_image !== existing.before_image) destroyImage(existing.before_image);
  if (after_image && after_image !== existing.after_image) destroyImage(existing.after_image);
  run(`UPDATE before_after SET title = COALESCE(?, title), before_image = COALESCE(?, before_image),
    after_image = COALESCE(?, after_image), description = COALESCE(?, description),
    sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active),
    updated_at = datetime('now') WHERE id = ?`,
    [title || null, before_image || null, after_image || null, description || null,
      sort_order != null ? sort_order : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Comparación actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id, before_image, after_image FROM before_after WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Comparación no encontrada", 404);
  destroyImage(existing.before_image);
  destroyImage(existing.after_image);
  run("DELETE FROM before_after WHERE id = ?", [req.params.id]);
  success(res, null, "Comparación eliminada");
};
