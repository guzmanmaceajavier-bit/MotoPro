const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { destroyImage } = require("../utils/cloudinary");

exports.list = (req, res) => {
  const { all } = req.query;
  let sql = "SELECT * FROM testimonials";
  if (all !== "1") sql += " WHERE is_active = 1";
  sql += " ORDER BY sort_order";
  success(res, query(sql));
};

exports.getById = (req, res) => {
  const testimonial = get("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
  if (!testimonial) return error(res, "Testimonio no encontrado", 404);
  success(res, testimonial);
};

exports.create = (req, res) => {
  const { name, role, content, rating, image } = req.body;
  if (!name || !content) return error(res, "Nombre y contenido requeridos", 400);
  const id = generateId();
  run("INSERT INTO testimonials (id, name, role, content, rating, image) VALUES (?, ?, ?, ?, ?, ?)",
    [id, name, role || "", content, rating || 5, image || null]);
  success(res, { id }, "Testimonio creado", 201);
};

exports.update = (req, res) => {
  const { name, role, content, rating, image, is_active, sort_order } = req.body;
  const existing = get("SELECT id, image FROM testimonials WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Testimonio no encontrado", 404);
  if (image && image !== existing.image) destroyImage(existing.image);
  run(`UPDATE testimonials SET name = COALESCE(?, name), role = COALESCE(?, role),
    content = COALESCE(?, content), rating = COALESCE(?, rating), image = COALESCE(?, image),
    is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order) WHERE id = ?`,
    [name || null, role || null, content || null, rating || null,
      image || null, is_active != null ? is_active : null, sort_order != null ? sort_order : null, req.params.id]);
  success(res, null, "Testimonio actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id, image FROM testimonials WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Testimonio no encontrado", 404);
  destroyImage(existing.image);
  run("DELETE FROM testimonials WHERE id = ?", [req.params.id]);
  success(res, null, "Testimonio eliminado");
};
