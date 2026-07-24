const { query, get, run } = require("../config/database");
const { generateId, slugify, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  success(res, query("SELECT * FROM blog_categories ORDER BY sort_order"));
};

exports.getById = (req, res) => {
  const cat = get("SELECT * FROM blog_categories WHERE id = ?", [req.params.id]);
  if (!cat) return error(res, "Categoría no encontrada", 404);
  success(res, cat);
};

exports.create = (req, res) => {
  const { name, color } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const id = generateId();
  const slug = slugify(name);
  run("INSERT INTO blog_categories (id, name, slug, color) VALUES (?, ?, ?, ?)",
    [id, name, slug, color || "bg-purple-500/10 text-purple-400"]);
  success(res, { id }, "Categoría creada", 201);
};

exports.update = (req, res) => {
  const { name, color, sort_order } = req.body;
  const existing = get("SELECT id FROM blog_categories WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Categoría no encontrada", 404);
  run("UPDATE blog_categories SET name = COALESCE(?, name), color = COALESCE(?, color), sort_order = COALESCE(?, sort_order) WHERE id = ?",
    [name || null, color || null, sort_order != null ? sort_order : null, req.params.id]);
  success(res, null, "Categoría actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM blog_categories WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Categoría no encontrada", 404);
  run("DELETE FROM blog_categories WHERE id = ?", [req.params.id]);
  success(res, null, "Categoría eliminada");
};
