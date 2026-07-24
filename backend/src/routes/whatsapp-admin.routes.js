const router = require("express").Router();
const { success, error } = require("../utils/helpers");
const { getTemplates, updateTemplate, getMessages, sendWhatsApp, getConfig } = require("../utils/whatsapp-full");

router.get("/config", (req, res) => {
  try {
    const config = getConfig();
    success(res, {
      enabled: config.enabled,
      number: config.number,
      api_ready: config.apiReady,
      templates: config.templates,
    });
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/templates", (req, res) => {
  try {
    success(res, getTemplates());
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.put("/templates/:name", (req, res) => {
  try {
    updateTemplate(req.params.name, req.body);
    success(res, null, "Plantilla actualizada");
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.post("/test", async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return error(res, "Teléfono y mensaje requeridos", 400);
    const sent = await sendWhatsApp(phone, message);
    success(res, { sent }, sent ? "Mensaje enviado" : "Error al enviar");
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/messages", (req, res) => {
  try {
    const result = getMessages(req.query);
    success(res, result);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/stats", (req, res) => {
  try {
    const { get, query } = require("../config/database");
    const total = get("SELECT COUNT(*) as c FROM whatsapp_messages");
    const sent = get("SELECT COUNT(*) as c FROM whatsapp_messages WHERE status = 'sent'");
    const failed = get("SELECT COUNT(*) as c FROM whatsapp_messages WHERE status = 'failed'");
    const today = get("SELECT COUNT(*) as c FROM whatsapp_messages WHERE date(created_at) = date('now')");
    const byDay = query(`SELECT date(created_at) as date, COUNT(*) as count, 
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent
      FROM whatsapp_messages WHERE created_at >= date('now', '-30 days')
      GROUP BY date(created_at) ORDER BY date`);

    success(res, {
      total: total?.c || 0,
      sent: sent?.c || 0,
      failed: failed?.c || 0,
      today: today?.c || 0,
      success_rate: total?.c > 0 ? Math.round((sent?.c / total.c) * 100) : 0,
      by_day: byDay,
    });
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

module.exports = router;
