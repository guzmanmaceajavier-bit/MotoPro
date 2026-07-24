const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, "Email y contraseña requeridos", 400);
    const user = get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return error(res, "Credenciales inválidas", 401);
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return error(res, "Credenciales inválidas", 401);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });
    const { password: _, ...userData } = user;
    success(res, { token, user: userData }, "Inicio de sesión exitoso");
  } catch (err) {
    console.error("Login error:", err);
    error(res, `Error interno: ${err.name} - ${err.message}`, 500);
  }
};

exports.register = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return error(res, "Todos los campos son requeridos", 400);
  if (password.length < 6) return error(res, "La contraseña debe tener al menos 6 caracteres", 400);
  const exists = get("SELECT id FROM users WHERE email = ?", [email]);
  if (exists) return error(res, "El email ya está registrado", 400);
  const id = generateId();
  const hashed = bcrypt.hashSync(password, 10);
  run("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'administrador')", [id, name, email, hashed]);
  success(res, { id }, "Usuario creado exitosamente", 201);
};

exports.me = (req, res) => {
  const user = get("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.user.id]);
  if (!user) return error(res, "Usuario no encontrado", 404);
  success(res, user);
};

exports.updateProfile = (req, res) => {
  const { name, email } = req.body;
  const id = req.user.id;
  if (email) {
    const dup = get("SELECT id FROM users WHERE email = ? AND id != ?", [email, id]);
    if (dup) return error(res, "El email ya está en uso", 400);
  }
  run("UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), updated_at = datetime('now') WHERE id = ?", [name || null, email || null, id]);
  success(res, null, "Perfil actualizado");
};
