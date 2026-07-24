const router = require("express").Router();
const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { getAllConfig, getConfigGroup, setConfig, setConfigBatch, initConfig } = require("../utils/settings");

router.get("/", (req, res) => {
  try {
    success(res, getAllConfig());
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/:group", (req, res) => {
  try {
    success(res, getConfigGroup(req.params.group));
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.put("/", (req, res) => {
  try {
    setConfigBatch(req.body);
    success(res, null, "Configuración actualizada");
  } catch (err) { console.error(err); error(res, "Error al actualizar", 500); }
});

router.put("/:key", (req, res) => {
  try {
    setConfig(req.params.key, req.body.value);
    success(res, null, "Configuración actualizada");
  } catch (err) { console.error(err); error(res, "Error al actualizar", 500); }
});

router.get("/branches/list", (req, res) => {
  try {
    const branches = query("SELECT * FROM branches ORDER BY name");
    success(res, branches);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.post("/branches", (req, res) => {
  try {
    const { name, address, phone, email, schedule, is_main } = req.body;
    if (!name) return error(res, "Nombre requerido", 400);
    const id = generateId();
    run("INSERT INTO branches (id, name, address, phone, email, schedule, is_main) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, name, address || "", phone || "", email || "", schedule || "", is_main ? 1 : 0]);
    success(res, { id }, "Sucursal creada", 201);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.put("/branches/:id", (req, res) => {
  try {
    const { name, address, phone, email, schedule, is_main } = req.body;
    run("UPDATE branches SET name = COALESCE(?, name), address = COALESCE(?, address), phone = COALESCE(?, phone), email = COALESCE(?, email), schedule = COALESCE(?, schedule), is_main = COALESCE(?, is_main) WHERE id = ?",
      [name, address, phone, email, schedule, is_main ? 1 : null, req.params.id]);
    success(res, null, "Sucursal actualizada");
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.delete("/branches/:id", (req, res) => {
  try {
    run("DELETE FROM branches WHERE id = ?", [req.params.id]);
    success(res, null, "Sucursal eliminada");
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/hours", (req, res) => {
  try {
    const config = getAllConfig();
    const hours = {
      monday: { start: config.work_start_hour || "8", end: config.work_end_hour || "18", enabled: true },
      tuesday: { start: config.work_start_hour || "8", end: config.work_end_hour || "18", enabled: true },
      wednesday: { start: config.work_start_hour || "8", end: config.work_end_hour || "18", enabled: true },
      thursday: { start: config.work_start_hour || "8", end: config.work_end_hour || "18", enabled: true },
      friday: { start: config.work_start_hour || "8", end: config.work_end_hour || "18", enabled: true },
      saturday: { start: config.work_start_saturday || "8", end: config.work_end_saturday || "13", enabled: true },
      sunday: { start: "0", end: "0", enabled: false },
    };
    // Try to load custom hours from DB
    const customHours = get("SELECT value FROM site_config WHERE key = 'custom_hours'");
    if (customHours?.value) {
      try { Object.assign(hours, JSON.parse(customHours.value)); } catch {}
    }
    success(res, hours);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.put("/hours", (req, res) => {
  try {
    setConfig("custom_hours", JSON.stringify(req.body));
    success(res, null, "Horarios actualizados");
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/holidays", (req, res) => {
  try {
    const holidays = query("SELECT * FROM holidays ORDER BY date");
    success(res, holidays);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.post("/holidays", (req, res) => {
  try {
    const { date, name, recurring } = req.body;
    if (!date || !name) return error(res, "Fecha y nombre requeridos", 400);
    const id = generateId();
    run("INSERT INTO holidays (id, date, name, recurring) VALUES (?, ?, ?, ?)",
      [id, date, name, recurring ? 1 : 0]);
    success(res, { id }, "Festivo agregado", 201);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.delete("/holidays/:id", (req, res) => {
  try {
    run("DELETE FROM holidays WHERE id = ?", [req.params.id]);
    success(res, null, "Festivo eliminado");
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/email-templates", (req, res) => {
  try {
    const { templates } = require("../utils/email-templates");
    const names = Object.keys(templates);
    success(res, names.map(n => ({ name: n, label: n.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()) })));
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/logs", (req, res) => {
  try {
    const { page = 1, limit = 50, entity_type, user_id, search } = req.query;
    const offset = (page - 1) * limit;
    let where = "1=1";
    const params = [];
    if (entity_type) { where += " AND l.entity_type = ?"; params.push(entity_type); }
    if (user_id) { where += " AND l.user_id = ?"; params.push(user_id); }
    if (search) { where += " AND l.description LIKE ?"; params.push(`%${search}%`); }

    const total = get(`SELECT COUNT(*) as c FROM activity_logs l WHERE ${where}`, params);
    const logs = query(`SELECT l.*, u.name as user_name
      FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id
      WHERE ${where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]);

    success(res, { logs, total: total?.c || 0, page: parseInt(page), pages: Math.ceil((total?.c || 0) / limit) });
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.delete("/logs", (req, res) => {
  try {
    run("DELETE FROM activity_logs");
    success(res, null, "Logs eliminados");
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

module.exports = router;
