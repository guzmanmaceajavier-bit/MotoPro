const { query, get, run } = require("../config/database");
const { generateId, slugify, success, error } = require("../utils/helpers");
const { destroyImage } = require("../utils/cloudinary");

exports.list = (req, res) => {
  const categories = query(`SELECT c.*,
    (SELECT json_group_array(json_object('id', s.id, 'name', s.name, 'count', s.count, 'sort_order', s.sort_order))
      FROM subcategories s WHERE s.category_id = c.id ORDER BY s.sort_order) as subcategories
    FROM categories c ORDER BY c.sort_order`);
  const parsed = categories.map(c => ({ ...c, subcategories: JSON.parse(c.subcategories || '[]') }));
  success(res, parsed);
};

exports.getById = (req, res) => {
  const cat = get(`SELECT c.*,
    (SELECT json_group_array(json_object('id', s.id, 'name', s.name, 'count', s.count, 'sort_order', s.sort_order))
      FROM subcategories s WHERE s.category_id = c.id ORDER BY s.sort_order) as subcategories
    FROM categories c WHERE c.id = ?`, [req.params.id]);
  if (!cat) return error(res, "Categoría no encontrada", 404);
  cat.subcategories = JSON.parse(cat.subcategories || '[]');
  success(res, cat);
};

exports.getBySlug = (req, res) => {
  const cat = get(`SELECT c.*,
    (SELECT json_group_array(json_object('id', s.id, 'name', s.name, 'count', s.count, 'sort_order', s.sort_order))
      FROM subcategories s WHERE s.category_id = c.id ORDER BY s.sort_order) as subcategories
    FROM categories c WHERE c.slug = ?`, [req.params.slug]);
  if (!cat) return error(res, "Categoría no encontrada", 404);
  cat.subcategories = JSON.parse(cat.subcategories || '[]');
  success(res, cat);
};

exports.create = (req, res) => {
  const { name, image } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const id = generateId();
  const slug = slugify(name);
  run("INSERT INTO categories (id, name, slug, image) VALUES (?, ?, ?, ?)", [id, name, slug, image || null]);
  success(res, { id }, "Categoría creada", 201);
};

exports.update = (req, res) => {
  const { name, image, sort_order } = req.body;
  const existing = get("SELECT id, image FROM categories WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Categoría no encontrada", 404);
  if (image && image !== existing.image) destroyImage(existing.image);
  run("UPDATE categories SET name = COALESCE(?, name), image = COALESCE(?, image), sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE id = ?",
    [name || null, image || null, sort_order != null ? sort_order : null, req.params.id]);
  success(res, null, "Categoría actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id, image FROM categories WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Categoría no encontrada", 404);
  destroyImage(existing.image);
  run("DELETE FROM subcategories WHERE category_id = ?", [req.params.id]);
  run("DELETE FROM categories WHERE id = ?", [req.params.id]);
  success(res, null, "Categoría eliminada");
};

exports.listSubcategories = (req, res) => {
  const subs = query("SELECT * FROM subcategories WHERE category_id = ? ORDER BY sort_order", [req.params.categoryId]);
  success(res, subs);
};

exports.createSubcategory = (req, res) => {
  const { name, count } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const id = generateId();
  run("INSERT INTO subcategories (id, category_id, name, count) VALUES (?, ?, ?, ?)", [id, req.params.categoryId, name, count || 0]);
  success(res, { id }, "Subcategoría creada", 201);
};

exports.updateSubcategory = (req, res) => {
  const { name, count, sort_order } = req.body;
  const existing = get("SELECT id FROM subcategories WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Subcategoría no encontrada", 404);
  run("UPDATE subcategories SET name = COALESCE(?, name), count = COALESCE(?, count), sort_order = COALESCE(?, sort_order) WHERE id = ?",
    [name || null, count != null ? count : null, sort_order != null ? sort_order : null, req.params.id]);
  success(res, null, "Subcategoría actualizada");
};

exports.removeSubcategory = (req, res) => {
  const existing = get("SELECT id FROM subcategories WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Subcategoría no encontrada", 404);
  run("DELETE FROM subcategories WHERE id = ?", [req.params.id]);
  success(res, null, "Subcategoría eliminada");
};
