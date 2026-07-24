const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { year, month } = req.query;
  let sql = "SELECT * FROM holidays";
  const params = [];
  const conditions = [];
  if (year && month) {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    conditions.push("date LIKE ?");
    params.push(`${prefix}%`);
  } else if (year) {
    conditions.push("date LIKE ?");
    params.push(`${year}%`);
  }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY date ASC";
  success(res, query(sql, params));
};

exports.create = (req, res) => {
  const { date, name, type, applies_to, mechanic_id } = req.body;
  if (!date || !name) return error(res, "Fecha y nombre son requeridos", 400);
  const existing = get("SELECT id FROM holidays WHERE date = ? AND (applies_to = 'all' OR applies_to = ?)", [date, applies_to || "all"]);
  if (existing) return error(res, "Ya existe un evento programado para esta fecha", 409);
  const id = generateId();
  run("INSERT INTO holidays (id, date, name, type, applies_to, mechanic_id) VALUES (?, ?, ?, ?, ?, ?)",
    [id, date, name, type || "holiday", applies_to || "all", mechanic_id || null]);
  success(res, { id }, "Evento creado", 201);
};

exports.update = (req, res) => {
  const { date, name, type, applies_to, mechanic_id } = req.body;
  const existing = get("SELECT id FROM holidays WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Evento no encontrado", 404);
  if (date) {
    const conflict = get("SELECT id FROM holidays WHERE date = ? AND id != ? AND (applies_to = 'all' OR applies_to = ?)", [date, req.params.id, applies_to || "all"]);
    if (conflict) return error(res, "Ya existe un evento para esta fecha", 409);
  }
  run(`UPDATE holidays SET date = COALESCE(?, date), name = COALESCE(?, name), type = COALESCE(?, type),
    applies_to = COALESCE(?, applies_to), mechanic_id = ? WHERE id = ?`,
    [date || null, name || null, type || null, applies_to || null, mechanic_id !== undefined ? mechanic_id : null, req.params.id]);
  success(res, null, "Evento actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM holidays WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Evento no encontrado", 404);
  run("DELETE FROM holidays WHERE id = ?", [req.params.id]);
  success(res, null, "Evento eliminado");
};

exports.checkDate = (req, res) => {
  const { date, mechanic_id } = req.query;
  if (!date) return error(res, "Fecha requerida", 400);
  const holiday = get(
    "SELECT * FROM holidays WHERE date = ? AND (applies_to = 'all' OR applies_to = ? OR (applies_to = 'mechanic' AND mechanic_id = ?))",
    [date, mechanic_id || "all", mechanic_id || ""]
  );
  success(res, { isBlocked: !!holiday, holiday: holiday || null });
};
