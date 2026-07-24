const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const mechanics = query(`SELECT tm.*, GROUP_CONCAT(
    json_object('id', ma.id, 'day_of_week', ma.day_of_week, 'start_time', ma.start_time, 'end_time', ma.end_time, 'is_available', ma.is_available)
  ) as availability FROM team_members tm LEFT JOIN mechanic_availability ma ON tm.id = ma.mechanic_id
  GROUP BY tm.id ORDER BY tm.sort_order ASC, tm.name ASC`);
  mechanics.forEach(m => {
    m.availability = m.availability ? JSON.parse(`[${m.availability}]`) : [];
  });
  success(res, mechanics);
};

exports.getById = (req, res) => {
  const mechanic = get("SELECT * FROM team_members WHERE id = ?", [req.params.id]);
  if (!mechanic) return error(res, "Mecánico no encontrado", 404);
  mechanic.availability = query("SELECT * FROM mechanic_availability WHERE mechanic_id = ?", [req.params.id]);
  success(res, mechanic);
};

exports.create = (req, res) => {
  const { name, role, specialty, experience, description, image, sort_order, availability } = req.body;
  if (!name) return error(res, "Nombre es requerido", 400);
  const id = generateId();
  run(`INSERT INTO team_members (id, name, role, specialty, experience, description, image, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, role || "", specialty || "", experience || "", description || "", image || null, sort_order || 0]);
  if (Array.isArray(availability)) {
    const stmt = "INSERT INTO mechanic_availability (id, mechanic_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?, ?)";
    availability.forEach(a => {
      run(stmt, [generateId(), id, a.day_of_week, a.start_time, a.end_time, a.is_available != null ? a.is_available : 1]);
    });
  }
  success(res, { id }, "Mecánico creado", 201);
};

exports.update = (req, res) => {
  const { name, role, specialty, experience, description, image, sort_order, availability } = req.body;
  const existing = get("SELECT id, image FROM team_members WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Mecánico no encontrado", 404);
  run(`UPDATE team_members SET name = COALESCE(?, name), role = COALESCE(?, role),
    specialty = COALESCE(?, specialty), experience = COALESCE(?, experience),
    description = COALESCE(?, description), image = COALESCE(?, image),
    sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE id = ?`,
    [name || null, role || null, specialty || null, experience || null, description || null, image || null, sort_order != null ? sort_order : null, req.params.id]);
  if (Array.isArray(availability)) {
    run("DELETE FROM mechanic_availability WHERE mechanic_id = ?", [req.params.id]);
    const stmt = "INSERT INTO mechanic_availability (id, mechanic_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?, ?)";
    availability.forEach(a => {
      run(stmt, [generateId(), req.params.id, a.day_of_week, a.start_time, a.end_time, a.is_available != null ? a.is_available : 1]);
    });
  }
  success(res, null, "Mecánico actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM team_members WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Mecánico no encontrado", 404);
  run("DELETE FROM mechanic_availability WHERE mechanic_id = ?", [req.params.id]);
  run("DELETE FROM team_members WHERE id = ?", [req.params.id]);
  success(res, null, "Mecánico eliminado");
};
