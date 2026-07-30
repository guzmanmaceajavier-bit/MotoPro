const { query } = require("../config/database");

function getConfig() {
  const configs = query("SELECT * FROM email_config");
  const cfg = {};
  configs.forEach((c) => { cfg[c.key] = c.value; });
  return cfg;
}

async function sendMail({ to, subject, html }) {
  const cfg = getConfig();
  if (!cfg.smtp_host || !cfg.smtp_user) return;
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: cfg.smtp_host,
      port: parseInt(cfg.smtp_port || "587"),
      secure: cfg.smtp_secure === "true",
      auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
    });
    await transporter.sendMail({
      from: `"${cfg.from_name || "Taller Motos"}" <${cfg.from_email || cfg.smtp_user}>`,
      to, subject, html,
    });
  } catch (e) { console.error("[backend]", e.message); }
}

async function notifyAdmin(subject, html) {
  const cfg = getConfig();
  const adminEmail = cfg.admin_email || cfg.smtp_user;
  if (adminEmail) await sendMail({ to: adminEmail, subject, html });
}

module.exports = { sendMail, notifyAdmin, getConfig };
