const jwt = require("jsonwebtoken");
const { get } = require("../config/database");
const { error } = require("../utils/helpers");

function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return error(res, "Token requerido", 401);
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, "Token inválido o expirado", 401);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, "No tienes permisos para esta acción", 403);
    }
    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return error(res, "No autenticado", 401);
    if (req.user.role === "superadmin") return next();
    try {
      const role = get("SELECT permissions FROM roles WHERE name = ?", [req.user.role]);
      if (!role) return error(res, "Rol no encontrado", 403);
      const perms = typeof role.permissions === "string" ? JSON.parse(role.permissions) : role.permissions;
      if (perms[permission]) return next();
      return error(res, "No tienes permiso para esta acción", 403);
    } catch (e) {
      return error(res, "Error verificando permisos", 500);
    }
  };
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      const token = header.split(" ")[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {}
  }
  next();
}

module.exports = { verifyToken, requireRole, requirePermission, optionalAuth };
