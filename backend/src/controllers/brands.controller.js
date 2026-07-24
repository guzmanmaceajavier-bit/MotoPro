const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { destroyImage } = require("../utils/cloudinary");

exports.list = (req, res) => {
  const brands = query(`
    SELECT b.*, COALESCE(pc.cnt, 0) as vehicle_count
    FROM brands b
    LEFT JOIN (SELECT brand_id, COUNT(*) as cnt FROM products GROUP BY brand_id) pc ON pc.brand_id = b.id
    ORDER BY b.sort_order
  `);
  const parsed = brands.map(b => ({ ...b, models: JSON.parse(b.models || '[]') }));
  success(res, parsed);
};

exports.getById = (req, res) => {
  const brand = get("SELECT * FROM brands WHERE id = ?", [req.params.id]);
  if (!brand) return error(res, "Marca no encontrada", 404);
  brand.models = JSON.parse(brand.models || '[]');
  success(res, brand);
};

exports.create = (req, res) => {
  const { name, image, models } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const id = generateId();
  run("INSERT INTO brands (id, name, image, models) VALUES (?, ?, ?, ?)", [id, name, image || null, JSON.stringify(models || [])]);
  success(res, { id }, "Marca creada", 201);
};

exports.update = (req, res) => {
  const { name, image, models, sort_order } = req.body;
  const existing = get("SELECT id, image FROM brands WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Marca no encontrada", 404);
  if (image && image !== existing.image) destroyImage(existing.image);
  run("UPDATE brands SET name = COALESCE(?, name), image = COALESCE(?, image), models = COALESCE(?, models), sort_order = COALESCE(?, sort_order) WHERE id = ?",
    [name || null, image || null, models ? JSON.stringify(models) : null, sort_order != null ? sort_order : null, req.params.id]);
  success(res, null, "Marca actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id, image FROM brands WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Marca no encontrada", 404);
  destroyImage(existing.image);
  run("UPDATE products SET brand_id = NULL WHERE brand_id = ?", [req.params.id]);
  run("DELETE FROM brands WHERE id = ?", [req.params.id]);
  success(res, null, "Marca eliminada");
};
