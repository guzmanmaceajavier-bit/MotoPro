const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { all } = req.query;
  let sql = "SELECT * FROM garage_bays";
  if (all !== "1") sql += " WHERE is_active = 1";
  sql += " ORDER BY sort_order";
  success(res, query(sql));
};

exports.getById = (req, res) => {
  const item = get("SELECT * FROM garage_bays WHERE id = ?", [req.params.id]);
  if (!item) return error(res, "No encontrado", 404);
  success(res, item);
};

exports.create = (req, res) => {
  const { title, subtitle, description, image, services, color } = req.body;
  if (!title) return error(res, "Título requerido", 400);
  const id = generateId();
  run("INSERT INTO garage_bays (id, title, subtitle, description, image, services, color) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, title, subtitle || "", description || "", image || null, JSON.stringify(services || []), color || "#FF6B00"]);
  success(res, { id }, "Creado", 201);
};

exports.update = (req, res) => {
  const { title, subtitle, description, image, services, color, sort_order, is_active } = req.body;
  const existing = get("SELECT id FROM garage_bays WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "No encontrado", 404);
  run(`UPDATE garage_bays SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle),
    description = COALESCE(?, description), image = COALESCE(?, image),
    services = CASE WHEN ? IS NOT NULL THEN ? ELSE services END,
    color = COALESCE(?, color), sort_order = COALESCE(?, sort_order),
    is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?`,
    [title || null, subtitle || null, description || null, image || null,
     services ? JSON.stringify(services) : null, services ? JSON.stringify(services) : null,
     color || null, sort_order != null ? sort_order : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM garage_bays WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "No encontrado", 404);
  run("DELETE FROM garage_bays WHERE id = ?", [req.params.id]);
  success(res, null, "Eliminado");
};
