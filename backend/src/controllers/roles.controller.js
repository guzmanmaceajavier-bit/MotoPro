const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  success(res, query("SELECT * FROM roles ORDER BY name"));
};

exports.getById = (req, res) => {
  const role = get("SELECT * FROM roles WHERE id = ?", [req.params.id]);
  if (!role) return error(res, "Rol no encontrado", 404);
  success(res, role);
};

exports.create = (req, res) => {
  const { name, description, permissions } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const dup = get("SELECT id FROM roles WHERE name = ?", [name]);
  if (dup) return error(res, "El rol ya existe", 400);
  const id = generateId();
  run("INSERT INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)",
    [id, name, description || "", JSON.stringify(permissions || {})]);
  success(res, { id }, "Rol creado", 201);
};

exports.update = (req, res) => {
  const { name, description, permissions, is_active } = req.body;
  const existing = get("SELECT id FROM roles WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Rol no encontrado", 404);
  run("UPDATE roles SET name = COALESCE(?, name), description = COALESCE(?, description), permissions = COALESCE(?, permissions), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
    [name || null, description || null, permissions ? JSON.stringify(permissions) : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Rol actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM roles WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Rol no encontrado", 404);
  run("DELETE FROM roles WHERE id = ?", [req.params.id]);
  success(res, null, "Rol eliminado");
};
