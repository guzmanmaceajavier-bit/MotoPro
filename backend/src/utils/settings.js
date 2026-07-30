const { get, run, query } = require("../config/database");

// Automatically logs all write operations to activity_logs

function auditLogger(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const startTime = Date.now();
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    const duration = Date.now() - startTime;
    try {
      const userId = req.user?.id || null;
      const action = req.method;
      const urlParts = req.originalUrl.split("?")[0].split("/").filter(Boolean);
      const entityType = urlParts[1] || "unknown";
      const entityId = req.params.id || null;

      // Skip logging for health checks, backups, etc.
      if (entityType === "health" || entityType === "backup") return originalJson(body);

      const description = `${action} ${req.originalUrl.split("?")[0]}${duration > 1000 ? ` (${duration}ms)` : ""}`;

      run(
        "INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
        [`log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId, action, entityType, entityId, description, req.ip || req.connection?.remoteAddress || ""]
      );
    } catch (e) { console.error("[backend]", e.message); }
    return originalJson(body);
  };

  next();
}

const defaultConfigs = {
  // Company
  company_name: "MotoPro",
  company_nit: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  company_website: "",
  company_logo: "",
  company_favicon: "",
  company_description: "",

  // Fiscal
  tax_name: "IVA",
  tax_rate: "19",
  invoice_prefix: "INV",
  quote_prefix: "COT",
  order_prefix: "MP",

  // Schedule
  work_start_hour: "8",
  work_end_hour: "18",
  work_start_saturday: "8",
  work_end_saturday: "13",
  slot_duration_minutes: "30",
  max_daily_appointments: "10",

  // Payments
  mercadopago_enabled: "false",
  mercadopago_public_key: "",
  mercadopago_access_token: "",
  cash_enabled: "true",
  card_enabled: "true",
  transfer_enabled: "true",
  nequi_enabled: "false",
  daviplata_enabled: "false",

  // Notifications
  email_notifications_enabled: "true",
  whatsapp_notifications_enabled: "false",
  sms_notifications_enabled: "false",
  auto_reminders_enabled: "true",
  survey_enabled: "true",
  survey_delay_days: "3",

  // Backup
  auto_backup_enabled: "false",
  backup_interval_hours: "24",
  backup_keep_count: "7",

  // SEO
  seo_title: "MotoPro - Taller de Motocicletas",
  seo_description: "Taller especializado en mantenimiento, reparación y personalización de motocicletas",
  seo_keywords: "motos, taller, reparación, mantenimiento, motocicletas",
  seo_og_image: "",

  // Appearance
  primary_color: "#0D9488",
  accent_color: "#FF6B00",
  dark_mode_default: "false",
  hero_title: "Tu taller de confianza",
  hero_subtitle: "Especialistas en motocicletas",
  hero_cta: "Agendar cita",
  footer_text: "© 2024 MotoPro. Todos los derechos reservados.",
};

function initConfig() {
  for (const [key, value] of Object.entries(defaultConfigs)) {
    const existing = get("SELECT key FROM site_config WHERE key = ?", [key]);
    if (!existing) {
      run("INSERT OR IGNORE INTO site_config (key, value) VALUES (?, ?)", [key, value]);
    }
  }
}

function getAllConfig() {
  const rows = query("SELECT key, value FROM site_config");
  const config = {};
  rows.forEach(r => { config[r.key] = r.value; });
  return config;
}

function getConfigGroup(group) {
  const config = getAllConfig();
  const groups = {
    company: ["company_name", "company_nit", "company_address", "company_phone", "company_email", "company_website", "company_logo", "company_favicon", "company_description"],
    fiscal: ["tax_name", "tax_rate", "invoice_prefix", "quote_prefix", "order_prefix"],
    schedule: ["work_start_hour", "work_end_hour", "work_start_saturday", "work_end_saturday", "slot_duration_minutes", "max_daily_appointments"],
    payments: ["mercadopago_enabled", "mercadopago_public_key", "mercadopago_access_token", "cash_enabled", "card_enabled", "transfer_enabled", "nequi_enabled", "daviplata_enabled"],
    notifications: ["email_notifications_enabled", "whatsapp_notifications_enabled", "sms_notifications_enabled", "auto_reminders_enabled", "survey_enabled", "survey_delay_days"],
    backup: ["auto_backup_enabled", "backup_interval_hours", "backup_keep_count"],
    seo: ["seo_title", "seo_description", "seo_keywords", "seo_og_image"],
    appearance: ["primary_color", "accent_color", "dark_mode_default", "hero_title", "hero_subtitle", "hero_cta", "footer_text"],
  };
  const keys = groups[group] || [];
  const result = {};
  keys.forEach(k => { result[k] = config[k] || defaultConfigs[k] || ""; });
  return result;
}

function setConfig(key, value) {
  const existing = get("SELECT key FROM site_config WHERE key = ?", [key]);
  if (existing) {
    run("UPDATE site_config SET value = ?, updated_at = datetime('now') WHERE key = ?", [value, key]);
  } else {
    run("INSERT INTO site_config (key, value) VALUES (?, ?)", [key, value]);
  }
}

function setConfigBatch(configs) {
  for (const [key, value] of Object.entries(configs)) {
    setConfig(key, value);
  }
}

module.exports = { auditLogger, initConfig, getAllConfig, getConfigGroup, setConfig, setConfigBatch, defaultConfigs };
