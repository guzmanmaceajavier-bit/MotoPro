const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  success(res, query("SELECT * FROM shipping_zones ORDER BY name"));
};

exports.getById = (req, res) => {
  const zone = get("SELECT * FROM shipping_zones WHERE id = ?", [req.params.id]);
  if (!zone) return error(res, "Zona no encontrada", 404);
  zone.regions = JSON.parse(zone.regions || "[]");
  success(res, zone);
};

exports.create = (req, res) => {
  const { name, regions, base_cost, extra_cost, free_minimum } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const id = generateId();
  run("INSERT INTO shipping_zones (id, name, regions, base_cost, extra_cost, free_minimum) VALUES (?, ?, ?, ?, ?, ?)",
    [id, name, JSON.stringify(regions || []), base_cost || 0, extra_cost || 0, free_minimum || 0]);
  success(res, { id }, "Zona creada", 201);
};

exports.update = (req, res) => {
  const { name, regions, base_cost, extra_cost, free_minimum, is_active } = req.body;
  const existing = get("SELECT id FROM shipping_zones WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Zona no encontrada", 404);
  run("UPDATE shipping_zones SET name = COALESCE(?, name), regions = COALESCE(?, regions), base_cost = COALESCE(?, base_cost), extra_cost = COALESCE(?, extra_cost), free_minimum = COALESCE(?, free_minimum), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
    [name || null, regions ? JSON.stringify(regions) : null, base_cost != null ? base_cost : null, extra_cost != null ? extra_cost : null, free_minimum != null ? free_minimum : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Zona actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM shipping_zones WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Zona no encontrada", 404);
  run("DELETE FROM shipping_zones WHERE id = ?", [req.params.id]);
  success(res, null, "Zona eliminada");
};