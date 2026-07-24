const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { destroyImage } = require("../utils/cloudinary");

exports.list = (req, res) => {
  const members = query("SELECT * FROM team_members ORDER BY sort_order");
  success(res, members);
};

exports.getById = (req, res) => {
  const member = get("SELECT * FROM team_members WHERE id = ?", [req.params.id]);
  if (!member) return error(res, "Miembro no encontrado", 404);
  success(res, member);
};

exports.create = (req, res) => {
  const { name, role, specialty, experience, description, image } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const id = generateId();
  run("INSERT INTO team_members (id, name, role, specialty, experience, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, name, role || "", specialty || "", experience || "", description || "", image || null]);
  success(res, { id }, "Miembro creado", 201);
};

exports.update = (req, res) => {
  const { name, role, specialty, experience, description, image, sort_order } = req.body;
  const existing = get("SELECT id, image FROM team_members WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Miembro no encontrado", 404);
  if (image && image !== existing.image) destroyImage(existing.image);
  run(`UPDATE team_members SET name = COALESCE(?, name), role = COALESCE(?, role),
    specialty = COALESCE(?, specialty), experience = COALESCE(?, experience),
    description = COALESCE(?, description), image = COALESCE(?, image),
    sort_order = COALESCE(?, sort_order) WHERE id = ?`,
    [name || null, role || null, specialty || null, experience || null,
      description || null, image || null, sort_order != null ? sort_order : null, req.params.id]);
  success(res, null, "Miembro actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id, image FROM team_members WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Miembro no encontrado", 404);
  destroyImage(existing.image);
  run("DELETE FROM team_members WHERE id = ?", [req.params.id]);
  success(res, null, "Miembro eliminado");
};
