const router = require("express").Router();
const dashboardCtrl = require("../controllers/dashboard.controller");
const logsCtrl = require("../controllers/logs.controller");
const emailConfigCtrl = require("../controllers/email-config.controller");
const notificationsCtrl = require("../controllers/notifications.controller");
const contactCtrl = require("../controllers/contact.controller");
const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { getAllConfig, getConfigGroup, setConfig, setConfigBatch } = require("../utils/settings");
const { verifyToken, requirePermission } = require("../middleware/auth");
const path = require("path");
const fs = require("fs");

router.get("/dashboard", verifyToken, requirePermission("orders.read"), dashboardCtrl.dashboard);

router.post("/backups", (req, res) => {
  try {
    const DATA_DIR = path.resolve(__dirname, "../../data");
    const BACKUP_DIR = path.resolve(__dirname, "../../data/backups");
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const dbPath = path.join(DATA_DIR, "database.sqlite");
    if (!fs.existsSync(dbPath)) return error(res, "Base de datos no encontrada", 404);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.sqlite`;
    fs.copyFileSync(dbPath, path.join(BACKUP_DIR, filename));
    const stats = fs.statSync(path.join(BACKUP_DIR, filename));
    success(res, { filename, size: stats.size, created_at: new Date().toISOString() }, "Backup creado");
  } catch (err) { console.error(err); error(res, "Error al crear backup", 500); }
});
router.get("/backups", (req, res) => {
  try {
    const BACKUP_DIR = path.resolve(__dirname, "../../data/backups");
    if (!fs.existsSync(BACKUP_DIR)) return success(res, []);
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".sqlite")).map(f => {
      const stats = fs.statSync(path.join(BACKUP_DIR, f));
      return { filename: f, size: stats.size, created_at: stats.mtime.toISOString() };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    success(res, files);
  } catch (err) { console.error(err); error(res, "Error al listar backups", 500); }
});
router.get("/backups/:filename/download", (req, res) => {
  try {
    const filePath = path.resolve(__dirname, "../../data/backups", req.params.filename);
    if (!fs.existsSync(filePath)) return error(res, "Backup no encontrado", 404);
    res.download(filePath, req.params.filename);
  } catch (err) { console.error(err); error(res, "Error al descargar", 500); }
});
router.delete("/backups/:filename", (req, res) => {
  try {
    const filePath = path.resolve(__dirname, "../../data/backups", req.params.filename);
    if (!fs.existsSync(filePath)) return error(res, "Backup no encontrado", 404);
    fs.unlinkSync(filePath);
    success(res, null, "Backup eliminado");
  } catch (err) { console.error(err); error(res, "Error al eliminar", 500); }
});
router.post("/backups/:filename/restore", (req, res) => {
  try {
    const DATA_DIR = path.resolve(__dirname, "../../data");
    const BACKUP_DIR = path.resolve(__dirname, "../../data/backups");
    const filePath = path.join(BACKUP_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return error(res, "Backup no encontrado", 404);
    const dbPath = path.join(DATA_DIR, "database.sqlite");
    const safetyName = `pre-restore-${Date.now()}.sqlite`;
    fs.copyFileSync(dbPath, path.join(BACKUP_DIR, safetyName));
    fs.copyFileSync(filePath, dbPath);
    success(res, { restored: req.params.filename, safety_backup: safetyName }, "Backup restaurado. Reinicia el servidor.");
  } catch (err) { console.error(err); error(res, "Error al restaurar", 500); }
});

router.get("/logs", verifyToken, requirePermission("logs.read"), logsCtrl.list);
router.post("/logs", verifyToken, requirePermission("logs.export"), logsCtrl.create);
router.delete("/logs", verifyToken, requirePermission("logs.export"), logsCtrl.clear);

router.get("/system-config", (req, res) => {
  try { success(res, getAllConfig()); } catch (err) { console.error(err); error(res, "Error", 500); }
});
router.get("/system-config/:group", (req, res) => {
  try { success(res, getConfigGroup(req.params.group)); } catch (err) { console.error(err); error(res, "Error", 500); }
});
router.put("/system-config", (req, res) => {
  try { setConfigBatch(req.body); success(res, null, "Configuración actualizada"); } catch (err) { console.error(err); error(res, "Error al actualizar", 500); }
});
router.put("/system-config/:key", (req, res) => {
  try { setConfig(req.params.key, req.body.value); success(res, null, "Configuración actualizada"); } catch (err) { console.error(err); error(res, "Error al actualizar", 500); }
});

router.get("/system-config/branches/list", (req, res) => {
  try { success(res, query("SELECT * FROM branches ORDER BY name")); } catch (err) { console.error(err); error(res, "Error", 500); }
});
router.post("/system-config/branches", (req, res) => {
  try {
    const { name, address, phone, email, schedule, is_main } = req.body;
    if (!name) return error(res, "Nombre requerido", 400);
    run("INSERT INTO branches (id, name, address, phone, email, schedule, is_main) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [generateId(), name, address || "", phone || "", email || "", schedule || "", is_main ? 1 : 0]);
    success(res, null, "Sucursal creada", 201);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});
router.put("/system-config/branches/:id", (req, res) => {
  try {
    const { name, address, phone, email, schedule, is_main } = req.body;
    run("UPDATE branches SET name = COALESCE(?,name), address = COALESCE(?,address), phone = COALESCE(?,phone), email = COALESCE(?,email), schedule = COALESCE(?,schedule), is_main = COALESCE(?,is_main) WHERE id = ?",
      [name, address, phone, email, schedule, is_main ? 1 : null, req.params.id]);
    success(res, null, "Sucursal actualizada");
  } catch (err) { console.error(err); error(res, "Error", 500); }
});
router.delete("/system-config/branches/:id", (req, res) => {
  try { run("DELETE FROM branches WHERE id = ?", [req.params.id]); success(res, null, "Sucursal eliminada"); } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/system-config/hours", (req, res) => {
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
    const customHours = get("SELECT value FROM site_config WHERE key = 'custom_hours'");
    if (customHours?.value) { try { Object.assign(hours, JSON.parse(customHours.value)); } catch {} }
    success(res, hours);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});
router.put("/system-config/hours", (req, res) => {
  try { setConfig("custom_hours", JSON.stringify(req.body)); success(res, null, "Horarios actualizados"); } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/system-config/email-templates", (req, res) => {
  try {
    const { templates } = require("../utils/email-templates");
    const names = Object.keys(templates);
    success(res, names.map(n => ({ name: n, label: n.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()) })));
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/system-config/logs", (req, res) => {
  try {
    const { page = 1, limit = 50, entity_type, user_id, search } = req.query;
    const offset = (page - 1) * limit;
    let where = "1=1";
    const params = [];
    if (entity_type) { where += " AND l.entity_type = ?"; params.push(entity_type); }
    if (user_id) { where += " AND l.user_id = ?"; params.push(user_id); }
    if (search) { where += " AND l.description LIKE ?"; params.push(`%${search}%`); }
    const total = get(`SELECT COUNT(*) as c FROM activity_logs l WHERE ${where}`, params);
    const logs = query(`SELECT l.*, u.name as user_name FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id WHERE ${where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]);
    success(res, { logs, total: total?.c || 0, page: parseInt(page), pages: Math.ceil((total?.c || 0) / limit) });
  } catch (err) { console.error(err); error(res, "Error", 500); }
});
router.delete("/system-config/logs", (req, res) => {
  try { run("DELETE FROM activity_logs"); success(res, null, "Logs eliminados"); } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/email-config", verifyToken, requirePermission("settings.read"), emailConfigCtrl.list);
router.put("/email-config", verifyToken, requirePermission("settings.write"), emailConfigCtrl.update);
router.post("/email-config/test", verifyToken, requirePermission("settings.write"), emailConfigCtrl.test);

router.get("/contact", verifyToken, requirePermission("contacts.read"), contactCtrl.list);
router.post("/contact", contactCtrl.create);
router.put("/contact/:id/read", verifyToken, requirePermission("contacts.reply"), contactCtrl.markRead);
router.delete("/contact/:id", verifyToken, requirePermission("contacts.delete"), contactCtrl.remove);

module.exports = router;
