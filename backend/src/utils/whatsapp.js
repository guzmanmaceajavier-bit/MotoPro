const https = require("https");
const http = require("http");

// Uses the Meta Cloud API (graph.facebook.com) for WhatsApp Business

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "";

function getConfig() {
  const { get } = require("../config/database");
  const enabled = get("SELECT value FROM site_config WHERE key = 'whatsapp_enabled'");
  const number = get("SELECT value FROM site_config WHERE key = 'whatsapp_number'");
  return {
    enabled: enabled?.value === "true" || enabled?.value === "1",
    number: number?.value || "",
    apiToken: WHATSAPP_TOKEN,
    phoneId: WHATSAPP_PHONE_ID,
    apiReady: !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_ID),
  };
}

async function sendWhatsAppAPI(phoneNumber, templateName, language, components) {
  const config = getConfig();
  if (!config.apiReady) return false;

  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber.replace(/[^0-9]/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: language || "es" },
      components: components || [],
    },
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
          if (result.messages) {
            console.log(`  ✓ WhatsApp sent to ${phoneNumber}`);
            resolve(true);
          } else {
            console.error("WhatsApp API error:", result.error?.message || body);
            resolve(false);
          }
        } catch (e) { console.error("[whatsapp]", e.message); resolve(false); }
      });
    });

    req.on("error", (err) => {
      console.error("WhatsApp request error:", err.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function sendWhatsAppMessage(phoneNumber, message) {
  const config = getConfig();
  if (!config.apiReady) return false;

  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber.replace(/[^0-9]/g, ""),
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
          resolve(!!result.messages);
        } catch (e) { console.error("[whatsapp]", e.message); resolve(false); }
      });
    });

    req.on("error", () => resolve(false));
    req.write(data);
    req.end();
  });
}

function getWhatsAppLink(phoneNumber, message) {
  const num = phoneNumber.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(message || "Hola, necesito información");
  return `https://wa.me/${num}?text=${text}`;
}


async function whatsappAppointmentConfirmation(appointment) {
  const config = getConfig();
  if (!config.enabled || !config.number) return;
  const phone = appointment.customer_phone || appointment.phone;
  if (!phone) return;

  const msg = `🏍️ *MotoPro - Cita Confirmada*\n\n` +
    `Hola ${appointment.customer_name},\n` +
    `Tu cita ha sido confirmada:\n\n` +
    `📋 Servicio: ${appointment.service_type}\n` +
    `📅 Fecha: ${new Date(appointment.appointment_date).toLocaleDateString("es-ES")}\n` +
    `⏰ Hora: ${new Date(appointment.appointment_date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}\n\n` +
    `¡Te esperamos!`;

  await sendWhatsAppMessage(phone, msg);
}

async function whatsappStatusChange(order, oldStatus, newStatus) {
  const config = getConfig();
  if (!config.enabled || !config.number) return;
  const phone = order.customer_phone || order.phone;
  if (!phone) return;

  const statusLabels = {
    received: "Recibido", diagnosed: "Diagnosticado", quoted: "Cotizado",
    approved: "Aprobado", in_progress: "En Reparación", quality_check: "Control Calidad",
    ready: "Listo para Entregar", delivered: "Entregado", cancelled: "Cancelado",
  };

  const msg = `🔧 *MotoPro - Actualización*\n\n` +
    `Hola ${order.customer_name},\n` +
    `Tu servicio *${order.order_number}* ha cambiado de estado:\n\n` +
    `➡️ *${statusLabels[newStatus] || newStatus}*\n\n` +
    `${process.env.SITE_URL || "http://localhost:3000"}/estado?orden=${order.order_number}`;

  await sendWhatsAppMessage(phone, msg);
}

async function whatsappQuoteReady(quote, customerName, customerPhone) {
  const config = getConfig();
  if (!config.enabled || !customerPhone) return;

  const msg = `📋 *MotoPro - Cotización*\n\n` +
    `Hola ${customerName},\n` +
    `Tu cotización *${quote.quote_number}* está lista:\n\n` +
    `💰 Total: $${Number(quote.total).toLocaleString()}\n\n` +
    `Revisa los detalles y aprueba para continuar.`;

  await sendWhatsAppMessage(customerPhone, msg);
}

async function whatsappDeliveryReady(order) {
  const config = getConfig();
  if (!config.enabled) return;
  const phone = order.customer_phone || order.phone;
  if (!phone) return;

  const msg = `✅ *MotoPro - ¡Tu moto está lista!*\n\n` +
    `Hola ${order.customer_name},\n` +
    `Tu servicio *${order.order_number}* ha sido completado.\n\n` +
    `Horario de atención:\n` +
    `📅 Lunes a Viernes: 8:00 - 18:00\n` +
    `📅 Sábados: 8:00 - 13:00\n\n` +
    `¡Te esperamos!`;

  await sendWhatsAppMessage(phone, msg);
}

async function whatsappAppointmentReminder(appointment) {
  const config = getConfig();
  if (!config.enabled) return;
  const phone = appointment.customer_phone || appointment.phone;
  if (!phone) return;

  const msg = `⏰ *MotoPro - Recordatorio*\n\n` +
    `Hola ${appointment.customer_name},\n` +
    `Te recordamos que tu cita es *mañana*:\n\n` +
    `📋 ${appointment.service_type}\n` +
    `📅 ${new Date(appointment.appointment_date).toLocaleDateString("es-ES")}\n` +
    `⏰ ${new Date(appointment.appointment_date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}\n\n` +
    `Por favor llega 10 minutos antes.`;

  await sendWhatsAppMessage(phone, msg);
}

module.exports = {
  getConfig,
  sendWhatsAppAPI,
  sendWhatsAppMessage,
  getWhatsAppLink,
  whatsappAppointmentConfirmation,
  whatsappStatusChange,
  whatsappQuoteReady,
  whatsappDeliveryReady,
  whatsappAppointmentReminder,
};
