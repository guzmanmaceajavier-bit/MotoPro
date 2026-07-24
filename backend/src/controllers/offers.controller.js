const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { all } = req.query;
  let sql = "SELECT * FROM offer_slides";
  if (all !== "1") sql += " WHERE is_active = 1";
  sql += " ORDER BY sort_order";
  success(res, query(sql));
};

exports.getById = (req, res) => {
  const slide = get("SELECT * FROM offer_slides WHERE id = ?", [req.params.id]);
  if (!slide) return error(res, "Slide no encontrado", 404);
  success(res, slide);
};

exports.create = (req, res) => {
  const { title, subtitle, description, image, gradient, cta_text, cta_link } = req.body;
  if (!title) return error(res, "Título requerido", 400);
  const id = generateId();
  run("INSERT INTO offer_slides (id, title, subtitle, description, image, gradient, cta_text, cta_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, title, subtitle || "", description || "", image || null, gradient || "from-purple-600 to-pink-500", cta_text || "Ver oferta", cta_link || "/tienda"]);
  success(res, { id }, "Slide creado", 201);
};

exports.update = (req, res) => {
  const { title, subtitle, description, image, gradient, cta_text, cta_link, sort_order, is_active } = req.body;
  const existing = get("SELECT id FROM offer_slides WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Slide no encontrado", 404);
  run("UPDATE offer_slides SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle), description = COALESCE(?, description), image = COALESCE(?, image), gradient = COALESCE(?, gradient), cta_text = COALESCE(?, cta_text), cta_link = COALESCE(?, cta_link), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
    [title || null, subtitle || null, description || null, image || null, gradient || null, cta_text || null, cta_link || null, sort_order != null ? sort_order : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Slide actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM offer_slides WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Slide no encontrado", 404);
  run("DELETE FROM offer_slides WHERE id = ?", [req.params.id]);
  success(res, null, "Slide eliminado");
};