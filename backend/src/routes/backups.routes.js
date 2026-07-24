const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const { success, error } = require("../utils/helpers");

const DATA_DIR = path.resolve(__dirname, "../../data");
const BACKUP_DIR = path.resolve(__dirname, "../../data/backups");

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

router.post("/", (req, res) => {
  try {
    const dbPath = path.join(DATA_DIR, "database.sqlite");
    if (!fs.existsSync(dbPath)) return error(res, "Base de datos no encontrada", 404);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.sqlite`;
    const backupPath = path.join(BACKUP_DIR, filename);

    fs.copyFileSync(dbPath, backupPath);

    const stats = fs.statSync(backupPath);
    success(res, { filename, size: stats.size, created_at: new Date().toISOString() }, "Backup creado");
  } catch (err) {
    console.error("Backup error:", err);
    error(res, "Error al crear backup", 500);
  }
});

router.get("/", (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith(".sqlite"))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          filename: f,
          size: stats.size,
          created_at: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    success(res, files);
  } catch (err) {
    console.error(err);
    error(res, "Error al listar backups", 500);
  }
});

router.get("/:filename/download", (req, res) => {
  try {
    const filePath = path.join(BACKUP_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return error(res, "Backup no encontrado", 404);
    res.download(filePath, req.params.filename);
  } catch (err) {
    console.error(err);
    error(res, "Error al descargar", 500);
  }
});

router.delete("/:filename", (req, res) => {
  try {
    const filePath = path.join(BACKUP_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return error(res, "Backup no encontrado", 404);
    fs.unlinkSync(filePath);
    success(res, null, "Backup eliminado");
  } catch (err) {
    console.error(err);
    error(res, "Error al eliminar", 500);
  }
});

router.post("/:filename/restore", (req, res) => {
  try {
    const filePath = path.join(BACKUP_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return error(res, "Backup no encontrado", 404);

    const dbPath = path.join(DATA_DIR, "database.sqlite");
    const safetyName = `pre-restore-${Date.now()}.sqlite`;
    fs.copyFileSync(dbPath, path.join(BACKUP_DIR, safetyName));

    fs.copyFileSync(filePath, dbPath);
    success(res, { restored: req.params.filename, safety_backup: safetyName }, "Backup restaurado. Reinicia el servidor.");
  } catch (err) {
    console.error(err);
    error(res, "Error al restaurar", 500);
  }
});

function autoBackup() {
  try {
    const { get } = require("../config/database");
    const enabled = get("SELECT value FROM site_config WHERE key = 'auto_backup_enabled'");
    if (enabled?.value !== "true" && enabled?.value !== "1") return;

    const dbPath = path.join(DATA_DIR, "database.sqlite");
    if (!fs.existsSync(dbPath)) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `auto-backup-${timestamp}.sqlite`;
    fs.copyFileSync(dbPath, path.join(BACKUP_DIR, filename));
    console.log(`  ✓ Auto backup created: ${filename}`);

    // Rotate old backups
    const keepCount = parseInt(get("SELECT value FROM site_config WHERE key = 'backup_keep_count'")?.value || "7");
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith("auto-backup-") && f.endsWith(".sqlite"))
      .sort()
      .reverse();

    files.slice(keepCount).forEach(f => {
      fs.unlinkSync(path.join(BACKUP_DIR, f));
      console.log(`  ✓ Rotated old backup: ${f}`);
    });
  } catch (err) {
    console.error("Auto backup error:", err.message);
  }
}

module.exports = router;
module.exports.autoBackup = autoBackup;
