const { query, get, run } = require("../config/database");
const { generateId, slugify, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { all } = req.query;
  let sql = "SELECT * FROM services";
  if (all !== "1") sql += " WHERE is_active = 1";
  sql += " ORDER BY sort_order";
  const services = query(sql);
  const parsed = services.map(s => ({ ...s, features: JSON.parse(s.features || '[]') }));
  success(res, parsed);
};

exports.getById = (req, res) => {
  const service = get("SELECT * FROM services WHERE id = ?", [req.params.id]);
  if (!service) return error(res, "Servicio no encontrado", 404);
  service.features = JSON.parse(service.features || '[]');
  success(res, service);
};

exports.create = (req, res) => {
  const { title, description, features, icon, icon_type, price, duration, accent } = req.body;
  if (!title) return error(res, "Título requerido", 400);
  const id = generateId();
  const slug = slugify(title);
  run("INSERT INTO services (id, title, slug, description, features, icon, icon_type, price, duration, accent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, title, slug, description || "", JSON.stringify(features || []), icon || "wrench", icon_type || "lucide", price || null, duration || null, accent || "#F59E0B"]);
  success(res, { id }, "Servicio creado", 201);
};

exports.update = (req, res) => {
  const { title, description, features, icon, icon_type, price, duration, accent, is_active, sort_order } = req.body;
  const existing = get("SELECT id FROM services WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Servicio no encontrado", 404);
  run(`UPDATE services SET title = COALESCE(?, title), description = COALESCE(?, description),
    features = COALESCE(?, features), icon = COALESCE(?, icon), icon_type = COALESCE(?, icon_type),
    price = ?, duration = COALESCE(?, duration), accent = COALESCE(?, accent),
    is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order) WHERE id = ?`,
    [title || null, description || null, features ? JSON.stringify(features) : null,
      icon || null, icon_type || null,
      price !== undefined ? price : null,
      duration || null, accent || null,
      is_active != null ? is_active : null, sort_order != null ? sort_order : null, req.params.id]);
  success(res, null, "Servicio actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM services WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Servicio no encontrado", 404);
  run("DELETE FROM services WHERE id = ?", [req.params.id]);
  success(res, null, "Servicio eliminado");
};
