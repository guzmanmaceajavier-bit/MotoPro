const https = require("https");
const { get, query, run } = require("../config/database");

const DEFAULT_TEMPLATES = {
  // Client messages
  appointment_confirmation: { enabled: true, recipient: "customer", label: "Confirmación de cita", template: null },
  appointment_reminder: { enabled: true, recipient: "customer", label: "Recordatorio de cita", template: null },
  status_change: { enabled: true, recipient: "customer", label: "Cambio de estado", template: null },
  quote_ready: { enabled: true, recipient: "customer", label: "Cotización disponible", template: null },
  service_completed: { enabled: true, recipient: "customer", label: "Servicio terminado", template: null },
  warranty_expiring: { enabled: true, recipient: "customer", label: "Garantía por vencer", template: null },
  order_confirmation: { enabled: true, recipient: "customer", label: "Confirmación de compra", template: null },
  order_status: { enabled: true, recipient: "customer", label: "Estado del pedido", template: null },
  // Admin messages
  new_appointment: { enabled: true, recipient: "admin", label: "Nueva cita agendada", template: null },
  new_order: { enabled: true, recipient: "admin", label: "Nuevo pedido", template: null },
  low_stock: { enabled: true, recipient: "admin", label: "Stock bajo", template: null },
  admin_reminder: { enabled: true, recipient: "admin", label: "Recordatorios importantes", template: null },
};

function getConfig() {
  const enabled = get("SELECT value FROM site_config WHERE key = 'whatsapp_notifications_enabled'");
  const number = get("SELECT value FROM site_config WHERE key = 'whatsapp_number'");
  const token = get("SELECT value FROM site_config WHERE key = 'whatsapp_api_token'");
  const phoneId = get("SELECT value FROM site_config WHERE key = 'whatsapp_phone_id'");
  const templates = get("SELECT value FROM site_config WHERE key = 'whatsapp_message_templates'");

  return {
    enabled: enabled?.value === "true" || enabled?.value === "1",
    number: number?.value || "",
    apiToken: token?.value || process.env.WHATSAPP_TOKEN || "",
    phoneId: phoneId?.value || process.env.WHATSAPP_PHONE_ID || "",
    apiReady: !!(token?.value || process.env.WHATSAPP_TOKEN) && !!(phoneId?.value || process.env.WHATSAPP_PHONE_ID),
    templates: templates?.value ? { ...DEFAULT_TEMPLATES, ...JSON.parse(templates.value) } : DEFAULT_TEMPLATES,
  };
}

function isTemplateEnabled(templateName) {
  const config = getConfig();
  return config.enabled && config.templates[templateName]?.enabled;
}

function getAdminPhone() {
  const config = getConfig();
  const adminPhone = get("SELECT value FROM site_config WHERE key = 'admin_whatsapp'");
  return adminPhone?.value || config.number;
}

async function sendWhatsApp(phoneNumber, message) {
  const config = getConfig();
  if (!config.enabled || !config.apiReady) return false;

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  if (cleanPhone.length < 10) return false;

  const payload = {
    messaging_product: "whatsapp",
    to: cleanPhone,
    type: "text",
    text: { body: message },
  };

  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: "graph.facebook.com",
      path: `/v18.0/${config.phoneId}/messages`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          const success = !!result.messages;
          logMessage(phoneNumber, message, success ? "sent" : "failed", result.error?.message);
          resolve(success);
        } catch (e) {
          console.error("[whatsapp]", e.message);
          logMessage(phoneNumber, message, "failed", result.error?.message);
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      logMessage(phoneNumber, message, "failed", err.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

function logMessage(phone, message, status, error) {
  try {
    run(
      "INSERT INTO whatsapp_messages (id, phone, message, status, error, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
      [`wa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, phone, message.substring(0, 500), status, error || ""]
    );
  } catch (e) { console.error("[whatsapp]", e.message); }
}


function buildMessage(templateName, data) {
  const builders = {
    appointment_confirmation: (d) =>
      `🏍️ *MotoPro - Cita Confirmada*\n\nHola *${d.customer_name}*,\nTu cita ha sido confirmada:\n\n📋 Servicio: ${d.service_type}\n📅 Fecha: ${d.date}\n⏰ Hora: ${d.time}\n${d.mechanic ? `👤 Mecánico: ${d.mechanic}` : ""}\n\n¡Te esperamos!`,

    appointment_reminder: (d) =>
      `⏰ *MotoPro - Recordatorio*\n\nHola *${d.customer_name}*,\nTe recordamos que tu cita es *mañana*:\n\n📋 ${d.service_type}\n📅 ${d.date}\n⏰ ${d.time}\n\nPor favor llega 10 minutos antes.`,

    status_change: (d) =>
      `🔧 *MotoPro - Actualización*\n\nHola *${d.customer_name}*,\nTu servicio *${d.order_number}* ha cambiado de estado:\n\n➡️ *${d.status_label}*\n${d.message ? `\n💬 ${d.message}` : ""}\n\n🔗 ${process.env.SITE_URL || "http://localhost:3000"}/estado?orden=${d.order_number}`,

    quote_ready: (d) =>
      `📋 *MotoPro - Cotización*\n\nHola *${d.customer_name}*,\nTu cotización *${d.quote_number}* está lista:\n\n💰 Total: $${Number(d.total).toLocaleString()}\n\nRevisa los detalles y aprueba para continuar.`,

    service_completed: (d) =>
      `✅ *MotoPro - ¡Tu moto está lista!*\n\nHola *${d.customer_name}*,\nTu servicio *${d.order_number}* ha sido completado.\n\nHorario de atención:\n📅 Lunes a Viernes: 8:00 - 18:00\n📅 Sábados: 8:00 - 13:00\n\n¡Te esperamos!`,

    warranty_expiring: (d) =>
      `🛡️ *MotoPro - Garantía*\n\nHola *${d.customer_name}*,\nTu garantía del servicio *${d.order_number}* vence en *${d.days_left} días*.\n\nSi tienes algún problema, contáctanos antes de que venza.`,

    order_confirmation: (d) =>
      `🛒 *MotoPro - Pedido Confirmado*\n\nHola *${d.customer_name}*,\nTu pedido *${d.order_number}* ha sido recibido.\n\n💰 Total: $${Number(d.total).toLocaleString()}\n📦 Estado: ${d.status}\n\nTe notificaremos cuando sea enviado.`,

    order_status: (d) =>
      `📦 *MotoPro - Estado del Pedido*\n\nHola *${d.customer_name}*,\nTu pedido *${d.order_number}*:\n\n➡️ *${d.status_label}*\n\n🔗 ${process.env.SITE_URL || "http://localhost:3000"}/compras`,

    new_appointment: (d) =>
      `📅 *MotoPro - Nueva Cita*\n\n📋 ${d.service_type}\n👤 ${d.customer_name}\n📞 ${d.customer_phone || "N/A"}\n📅 ${d.date} a las ${d.time}\n${d.mechanic ? `🔧 Mecánico: ${d.mechanic}` : ""}`,

    new_order: (d) =>
      `🛒 *MotoPro - Nuevo Pedido*\n\n📋 Pedido: ${d.order_number}\n👤 ${d.customer_name}\n💰 Total: $${Number(d.total).toLocaleString()}\n📦 ${d.item_count} producto(s)`,

    low_stock: (d) =>
      `⚠️ *MotoPro - Stock Bajo*\n\n${d.product_name} (${d.sku})\n📊 Stock actual: ${d.stock}\n📉 Mínimo: ${d.min_stock}\n\nRevisa el inventario.`,

    admin_reminder: (d) =>
      `🔔 *MotoPro - Recordatorio*\n\n${d.message}`,
  };

  const builder = builders[templateName];
  return builder ? builder(data) : null;
}

async function sendNotification(templateName, data, customPhone) {
  const config = getConfig();
  if (!isTemplateEnabled(templateName)) return false;

  const message = buildMessage(templateName, data);
  if (!message) return false;

  let phone = customPhone;
  if (!phone && data.customer_id) {
    const customer = get("SELECT phone FROM customers WHERE id = ?", [data.customer_id]);
    phone = customer?.phone;
  }
  if (!phone && data.customer_phone) {
    phone = data.customer_phone;
  }

  if (!phone) return false;

  // Route to correct recipient
  const template = config.templates[templateName];
  if (template?.recipient === "admin") {
    phone = getAdminPhone() || phone;
  }

  return await sendWhatsApp(phone, message);
}

function getTemplates() {
  return getConfig().templates;
}

function updateTemplate(templateName, updates) {
  const config = getConfig();
  const templates = config.templates;
  if (templates[templateName]) {
    templates[templateName] = { ...templates[templateName], ...updates };
    run("UPDATE site_config SET value = ?, updated_at = datetime('now') WHERE key = 'whatsapp_message_templates'",
      [JSON.stringify(templates)]);
  }
}

function getMessages({ page = 1, limit = 20, status, search } = {}) {
  let where = "1=1";
  const params = [];
  if (status) { where += " AND status = ?"; params.push(status); }
  if (search) { where += " AND (phone LIKE ? OR message LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
  const total = get(`SELECT COUNT(*) as c FROM whatsapp_messages WHERE ${where}`, params);
  const messages = query(`SELECT * FROM whatsapp_messages WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), (page - 1) * parseInt(limit)]);
  return { messages, total: total?.c || 0, page: parseInt(page), pages: Math.ceil((total?.c || 0) / limit) };
}

module.exports = {
  getConfig,
  isTemplateEnabled,
  sendWhatsApp,
  sendNotification,
  buildMessage,
  getTemplates,
  updateTemplate,
  getMessages,
  DEFAULT_TEMPLATES,
};
