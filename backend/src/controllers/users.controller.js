const bcrypt = require("bcryptjs");
const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const users = query("SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC");
  success(res, users);
};

exports.getById = (req, res) => {
  const user = get("SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?", [req.params.id]);
  if (!user) return error(res, "Usuario no encontrado", 404);
  success(res, user);
};

exports.create = (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return error(res, "Nombre, email y contraseña requeridos", 400);
  if (password.length < 6) return error(res, "La contraseña debe tener al menos 6 caracteres", 400);
  const dup = get("SELECT id FROM users WHERE email = ?", [email]);
  if (dup) return error(res, "El email ya está registrado", 400);
  const id = generateId();
  const hashed = bcrypt.hashSync(password, 10);
  run("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
    [id, name, email, hashed, role || "administrador"]);
  success(res, { id }, "Usuario creado", 201);
};

exports.update = (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = get("SELECT id FROM users WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Usuario no encontrado", 404);
  if (email) {
    const dup = get("SELECT id FROM users WHERE email = ? AND id != ?", [email, req.params.id]);
    if (dup) return error(res, "El email ya está en uso", 400);
  }
  let sql = "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), updated_at = datetime('now')";
  const params = [name || null, email || null, role || null];
  if (password) {
    const hashed = bcrypt.hashSync(password, 10);
    sql += ", password = ?";
    params.push(hashed);
  }
  sql += " WHERE id = ?";
  params.push(req.params.id);
  run(sql, params);
  success(res, null, "Usuario actualizado");
};

exports.remove = (req, res) => {
  if (req.params.id === req.user.id) return error(res, "No puedes eliminarte a ti mismo", 400);
  const existing = get("SELECT id FROM users WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Usuario no encontrado", 404);
  run("DELETE FROM users WHERE id = ?", [req.params.id]);
  success(res, null, "Usuario eliminado");
};
