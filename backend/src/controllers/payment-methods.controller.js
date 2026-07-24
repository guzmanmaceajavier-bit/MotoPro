const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  success(res, query("SELECT * FROM payment_methods ORDER BY sort_order"));
};

exports.getById = (req, res) => {
  const pm = get("SELECT * FROM payment_methods WHERE id = ?", [req.params.id]);
  if (!pm) return error(res, "Método no encontrado", 404);
  pm.config = JSON.parse(pm.config || "{}");
  success(res, pm);
};

exports.create = (req, res) => {
  const { name, provider, config } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const id = generateId();
  run("INSERT INTO payment_methods (id, name, provider, config) VALUES (?, ?, ?, ?)",
    [id, name, provider || "manual", JSON.stringify(config || {})]);
  success(res, { id }, "Método creado", 201);
};

exports.update = (req, res) => {
  const { name, provider, config, is_active, sort_order } = req.body;
  const existing = get("SELECT id FROM payment_methods WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Método no encontrado", 404);
  run("UPDATE payment_methods SET name = COALESCE(?, name), provider = COALESCE(?, provider), config = COALESCE(?, config), is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE id = ?",
    [name || null, provider || null, config ? JSON.stringify(config) : null, is_active != null ? is_active : null, sort_order != null ? sort_order : null, req.params.id]);
  success(res, null, "Método actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM payment_methods WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Método no encontrado", 404);
  run("DELETE FROM payment_methods WHERE id = ?", [req.params.id]);
  success(res, null, "Método eliminado");
};