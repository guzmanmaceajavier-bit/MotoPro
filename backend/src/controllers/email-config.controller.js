const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const configs = query("SELECT * FROM email_config");
  const map = {};
  configs.forEach((c) => { map[c.key] = c.value; });
  success(res, map);
};

exports.update = (req, res) => {
  const configs = req.body;
  if (!configs || typeof configs !== "object") return error(res, "Configuración requerida", 400);
  Object.entries(configs).forEach(([key, value]) => {
    const existing = get("SELECT id FROM email_config WHERE key = ?", [key]);
    if (existing) run("UPDATE email_config SET value = ?, updated_at = datetime('now') WHERE key = ?", [String(value), key]);
    else run("INSERT INTO email_config (id, key, value) VALUES (?, ?, ?)", [generateId(), key, String(value)]);
  });
  success(res, null, "Configuración actualizada");
};

exports.test = async (req, res) => {
  const { to } = req.body;
  if (!to) return error(res, "Email destino requerido", 400);
  try {
    const nodemailer = require("nodemailer");
    const configs = query("SELECT * FROM email_config");
    const cfg = {};
    configs.forEach((c) => { cfg[c.key] = c.value; });
    if (!cfg.smtp_host || !cfg.smtp_user) return error(res, "SMTP no configurado", 400);
    const transporter = nodemailer.createTransport({
      host: cfg.smtp_host, port: parseInt(cfg.smtp_port || "587"), secure: cfg.smtp_secure === "true",
      auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
    });
    await transporter.sendMail({
      from: `"${cfg.from_name || "MotoPro"}" <${cfg.from_email || cfg.smtp_user}>`,
      to, subject: "Prueba de configuración - MotoPro",
      html: "<h1>✅ Correo configurado correctamente</h1><p>Este es un mensaje de prueba desde el panel de MotoPro.</p>",
    });
    success(res, null, "Correo de prueba enviado");
  } catch (err) {
    error(res, "Error al enviar: " + err.message, 500);
  }
};