const { query, get, run } = require("../config/database");
const { generateId, slugify, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  success(res, query("SELECT * FROM service_categories ORDER BY sort_order"));
};

exports.getById = (req, res) => {
  const cat = get("SELECT * FROM service_categories WHERE id = ?", [req.params.id]);
  if (!cat) return error(res, "Categoría no encontrada", 404);
  success(res, cat);
};

exports.create = (req, res) => {
  const { name } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const id = generateId();
  const slug = slugify(name);
  run("INSERT INTO service_categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)",
    [id, name, slug, req.body.sort_order || 0]);
  success(res, { id }, "Categoría creada", 201);
};

exports.update = (req, res) => {
  const existing = get("SELECT id FROM service_categories WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Categoría no encontrada", 404);
  run(`UPDATE service_categories SET name = COALESCE(?, name), slug = COALESCE(?, slug),
    sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE id = ?`,
    [req.body.name || null, req.body.name ? slugify(req.body.name) : null,
     req.body.sort_order != null ? req.body.sort_order : null, req.params.id]);
  success(res, null, "Categoría actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM service_categories WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Categoría no encontrada", 404);
  run("DELETE FROM service_categories WHERE id = ?", [req.params.id]);
  success(res, null, "Categoría eliminada");
};
