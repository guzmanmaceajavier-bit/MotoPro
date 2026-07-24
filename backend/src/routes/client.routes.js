const router = require("express").Router();
const { query, get, run } = require("../config/database");
const { verifyToken } = require("../middleware/auth");
const { generateId, success, error } = require("../utils/helpers");

// All routes require auth
router.use(verifyToken);

// --- VEHICLES ---
router.get("/vehicles", (req, res) => {
  try {
    const vehicles = query("SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC", [req.user.id]);
    success(res, vehicles);
  } catch (err) { console.error(err); error(res, "Error al obtener vehículos", 500); }
});

router.get("/vehicles/:id", (req, res) => {
  try {
    const vehicle = get("SELECT * FROM vehicles WHERE id = ? AND customer_id = ?", [req.params.id, req.user.id]);
    if (!vehicle) return error(res, "Vehículo no encontrado", 404);
    const services = query("SELECT id, order_number, status, created_at, estimated_delivery FROM work_orders WHERE vehicle_id = ? ORDER BY created_at DESC LIMIT 20", [vehicle.id]);
    vehicle.services = services;
    success(res, vehicle);
  } catch (err) { console.error(err); error(res, "Error al obtener vehículo", 500); }
});

router.post("/vehicles", (req, res) => {
  try {
    const { brand, model, year, plate, vin, color, mileage, notes } = req.body;
    if (!brand || !model || !year) return error(res, "Marca, modelo y año requeridos", 400);
    const id = generateId();
    run("INSERT INTO vehicles (id, customer_id, brand, model, year, plate, vin, color, mileage, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, req.user.id, brand, model, year, plate || "", vin || "", color || "", mileage || 0, notes || ""]);
    success(res, { id }, "Vehículo registrado", 201);
  } catch (err) { console.error(err); error(res, "Error al crear vehículo", 500); }
});

router.put("/vehicles/:id", (req, res) => {
  try {
    const vehicle = get("SELECT id FROM vehicles WHERE id = ? AND customer_id = ?", [req.params.id, req.user.id]);
    if (!vehicle) return error(res, "Vehículo no encontrado", 404);
    const { brand, model, year, plate, vin, color, mileage, notes } = req.body;
    run("UPDATE vehicles SET brand = COALESCE(?, brand), model = COALESCE(?, model), year = COALESCE(?, year), plate = COALESCE(?, plate), vin = COALESCE(?, vin), color = COALESCE(?, color), mileage = COALESCE(?, mileage), notes = COALESCE(?, notes), updated_at = datetime('now') WHERE id = ?",
      [brand, model, year, plate, vin, color, mileage, notes, req.params.id]);
    success(res, null, "Vehículo actualizado");
  } catch (err) { console.error(err); error(res, "Error al actualizar vehículo", 500); }
});

router.delete("/vehicles/:id", (req, res) => {
  try {
    const vehicle = get("SELECT id FROM vehicles WHERE id = ? AND customer_id = ?", [req.params.id, req.user.id]);
    if (!vehicle) return error(res, "Vehículo no encontrado", 404);
    run("DELETE FROM vehicles WHERE id = ?", [req.params.id]);
    success(res, null, "Vehículo eliminado");
  } catch (err) { console.error(err); error(res, "Error al eliminar vehículo", 500); }
});

// --- SERVICES (Work Orders) ---
router.get("/services", (req, res) => {
  try {
    const services = query(`SELECT wo.id, wo.order_number, wo.service_type, wo.vehicle_description, wo.status, wo.priority, wo.estimated_delivery, wo.total_parts, wo.total_labor, wo.total, wo.created_at
      FROM work_orders wo WHERE wo.customer_id = ? OR wo.customer_email = (SELECT email FROM customers WHERE id = ?)
      ORDER BY wo.created_at DESC`, [req.user.id, req.user.id]);
    success(res, services);
  } catch (err) { console.error(err); error(res, "Error al obtener servicios", 500); }
});

router.get("/services/:id", (req, res) => {
  try {
    const service = get(`SELECT wo.*, wo.id as id FROM work_orders wo WHERE wo.id = ? AND (wo.customer_id = ? OR wo.customer_email = (SELECT email FROM customers WHERE id = ?))`,
      [req.params.id, req.user.id, req.user.id]);
    if (!service) return error(res, "Servicio no encontrado", 404);
    const timeline = query("SELECT * FROM work_order_timeline WHERE work_order_id = ? ORDER BY created_at ASC", [service.id]);
    const parts = query("SELECT * FROM work_order_parts WHERE work_order_id = ? ORDER BY created_at ASC", [service.id]);
    const checklist = query("SELECT * FROM work_order_checklist WHERE work_order_id = ? ORDER BY created_at ASC", [service.id]);
    service.timeline = timeline;
    service.parts = parts;
    service.checklist = checklist;
    success(res, service);
  } catch (err) { console.error(err); error(res, "Error al obtener servicio", 500); }
});

// --- QUOTES (from work orders) ---
router.get("/quotes", (req, res) => {
  try {
    const quotes = query(`SELECT q.*, wo.order_number, wo.service_type
      FROM quotes q
      JOIN work_orders wo ON q.work_order_id = wo.id
      WHERE wo.customer_id = ? OR wo.customer_email = (SELECT email FROM customers WHERE id = ?)
      ORDER BY q.created_at DESC`, [req.user.id, req.user.id]);
    success(res, quotes);
  } catch (err) { console.error(err); error(res, "Error al obtener cotizaciones", 500); }
});

router.get("/quotes/:id", (req, res) => {
  try {
    const quote = get(`SELECT q.*, wo.order_number, wo.service_type, wo.vehicle_description
      FROM quotes q
      JOIN work_orders wo ON q.work_order_id = wo.id
      WHERE q.id = ? AND (wo.customer_id = ? OR wo.customer_email = (SELECT email FROM customers WHERE id = ?))`,
      [req.params.id, req.user.id, req.user.id]);
    if (!quote) return error(res, "Cotización no encontrada", 404);
    const items = query("SELECT * FROM quote_items WHERE quote_id = ?", [quote.id]);
    quote.items = items;
    success(res, quote);
  } catch (err) { console.error(err); error(res, "Error al obtener cotización", 500); }
});

router.put("/quotes/:id/approve", (req, res) => {
  try {
    const quote = get(`SELECT q.*, wo.customer_id, wo.customer_email
      FROM quotes q JOIN work_orders wo ON q.work_order_id = wo.id
      WHERE q.id = ?`, [req.params.id]);
    if (!quote) return error(res, "Cotización no encontrada", 404);
    const customer = get("SELECT email FROM customers WHERE id = ?", [req.user.id]);
    if (quote.customer_id !== req.user.id && quote.customer_email !== customer?.email) {
      return error(res, "No autorizado", 403);
    }
    if (quote.status !== "pending" && quote.status !== "sent") return error(res, "Cotización no puede ser aprobada", 400);
    run("UPDATE quotes SET status = 'approved', approved_at = datetime('now') WHERE id = ?", [quote.id]);
    run("UPDATE work_orders SET status = 'approved' WHERE id = ?", [quote.work_order_id]);
    success(res, null, "Cotización aprobada");
  } catch (err) { console.error(err); error(res, "Error al aprobar cotización", 500); }
});

router.put("/quotes/:id/reject", (req, res) => {
  try {
    const quote = get(`SELECT q.*, wo.customer_id, wo.customer_email
      FROM quotes q JOIN work_orders wo ON q.work_order_id = wo.id
      WHERE q.id = ?`, [req.params.id]);
    if (!quote) return error(res, "Cotización no encontrada", 404);
    const customer = get("SELECT email FROM customers WHERE id = ?", [req.user.id]);
    if (quote.customer_id !== req.user.id && quote.customer_email !== customer?.email) {
      return error(res, "No autorizado", 403);
    }
    run("UPDATE quotes SET status = 'rejected' WHERE id = ?", [quote.id]);
    run("UPDATE work_orders SET status = 'quoted' WHERE id = ?", [quote.work_order_id]);
    success(res, null, "Cotización rechazada");
  } catch (err) { console.error(err); error(res, "Error al rechazar cotización", 500); }
});

// --- APPOINTMENTS ---
router.get("/appointments", (req, res) => {
  try {
    const appts = query("SELECT * FROM appointments WHERE customer_id = ? ORDER BY appointment_date DESC", [req.user.id]);
    success(res, appts);
  } catch (err) { console.error(err); error(res, "Error al obtener citas", 500); }
});

router.post("/appointments", (req, res) => {
  try {
    const { service_type, vehicle_description, appointment_date, notes } = req.body;
    if (!service_type || !appointment_date) return error(res, "Tipo de servicio y fecha requeridos", 400);
    const id = generateId();
    const customer = get("SELECT name, email, phone FROM customers WHERE id = ?", [req.user.id]);
    run("INSERT INTO appointments (id, customer_id, customer_name, customer_email, customer_phone, service_type, vehicle_description, appointment_date, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
      [id, req.user.id, customer?.name || "", customer?.email || "", customer?.phone || "", service_type, vehicle_description || "", appointment_date, notes || ""]);
    success(res, { id }, "Cita agendada", 201);
  } catch (err) { console.error(err); error(res, "Error al agendar cita", 500); }
});

router.put("/appointments/:id/cancel", (req, res) => {
  try {
    const appt = get("SELECT id, status FROM appointments WHERE id = ? AND customer_id = ?", [req.params.id, req.user.id]);
    if (!appt) return error(res, "Cita no encontrada", 404);
    if (["completed", "cancelled"].includes(appt.status)) return error(res, "No se puede cancelar esta cita", 400);
    run("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [appt.id]);
    success(res, null, "Cita cancelada");
  } catch (err) { console.error(err); error(res, "Error al cancelar cita", 500); }
});

// --- PURCHASES (Store Orders) ---
router.get("/purchases", (req, res) => {
  try {
    const customer = get("SELECT email FROM customers WHERE id = ?", [req.user.id]);
    const orders = query("SELECT * FROM store_orders WHERE customer_id = ? OR customer_email = ? ORDER BY created_at DESC",
      [req.user.id, customer?.email || ""]);
    success(res, orders);
  } catch (err) { console.error(err); error(res, "Error al obtener compras", 500); }
});

router.get("/purchases/:id", (req, res) => {
  try {
    const customer = get("SELECT email FROM customers WHERE id = ?", [req.user.id]);
    const order = get("SELECT * FROM store_orders WHERE id = ? AND (customer_id = ? OR customer_email = ?)",
      [req.params.id, req.user.id, customer?.email || ""]);
    if (!order) return error(res, "Compra no encontrada", 404);
    if (order.items && typeof order.items === "string") order.items = JSON.parse(order.items);
    success(res, order);
  } catch (err) { console.error(err); error(res, "Error al obtener compra", 500); }
});

// --- INVOICES ---
router.get("/invoices", (req, res) => {
  try {
    const customer = get("SELECT email FROM customers WHERE id = ?", [req.user.id]);
    const invoices = query("SELECT * FROM invoices WHERE customer_id = ? OR customer_email = ? ORDER BY created_at DESC",
      [req.user.id, customer?.email || ""]);
    success(res, invoices);
  } catch (err) { console.error(err); error(res, "Error al obtener facturas", 500); }
});

router.get("/invoices/:id", (req, res) => {
  try {
    const customer = get("SELECT email FROM customers WHERE id = ?", [req.user.id]);
    const invoice = get("SELECT * FROM invoices WHERE id = ? AND (customer_id = ? OR customer_email = ?)",
      [req.params.id, req.user.id, customer?.email || ""]);
    if (!invoice) return error(res, "Factura no encontrada", 404);
    success(res, invoice);
  } catch (err) { console.error(err); error(res, "Error al obtener factura", 500); }
});

// --- WARRANTIES ---
router.get("/warranties", (req, res) => {
  try {
    const warranties = query(`SELECT w.*, wo.order_number, wo.service_type
      FROM warranties w
      JOIN work_orders wo ON w.work_order_id = wo.id
      WHERE wo.customer_id = ? OR wo.customer_email = (SELECT email FROM customers WHERE id = ?)
      ORDER BY w.created_at DESC`, [req.user.id, req.user.id]);
    success(res, warranties);
  } catch (err) { console.error(err); error(res, "Error al obtener garantías", 500); }
});

router.get("/warranties/:id", (req, res) => {
  try {
    const warranty = get(`SELECT w.*, wo.order_number, wo.service_type, wo.vehicle_description
      FROM warranties w
      JOIN work_orders wo ON w.work_order_id = wo.id
      WHERE w.id = ? AND (wo.customer_id = ? OR wo.customer_email = (SELECT email FROM customers WHERE id = ?))`,
      [req.params.id, req.user.id, req.user.id]);
    if (!warranty) return error(res, "Garantía no encontrada", 404);
    success(res, warranty);
  } catch (err) { console.error(err); error(res, "Error al obtener garantía", 500); }
});

// --- NOTIFICATIONS ---
router.get("/notifications", (req, res) => {
  try {
    const notifs = query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [req.user.id]);
    success(res, notifs);
  } catch (err) { console.error(err); error(res, "Error al obtener notificaciones", 500); }
});

router.put("/notifications/:id/read", (req, res) => {
  try {
    run("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    success(res, null, "Marcada como leída");
  } catch (err) { console.error(err); error(res, "Error al actualizar", 500); }
});

router.put("/notifications/read-all", (req, res) => {
  try {
    run("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0", [req.user.id]);
    success(res, null, "Todas marcadas como leídas");
  } catch (err) { console.error(err); error(res, "Error al actualizar", 500); }
});

// --- DASHBOARD STATS ---
router.get("/stats", (req, res) => {
  try {
    const customer = get("SELECT email FROM customers WHERE id = ?", [req.user.id]);
    const vehicles = get("SELECT COUNT(*) as count FROM vehicles WHERE customer_id = ?", [req.user.id]);
    const activeServices = get(`SELECT COUNT(*) as count FROM work_orders WHERE (customer_id = ? OR customer_email = ?) AND status NOT IN ('delivered', 'cancelled')`,
      [req.user.id, customer?.email || ""]);
    const purchases = get("SELECT COUNT(*) as count FROM store_orders WHERE customer_id = ? OR customer_email = ?",
      [req.user.id, customer?.email || ""]);
    const pendingInvoices = get(`SELECT COUNT(*) as count FROM invoices WHERE (customer_id = ? OR customer_email = ?) AND status != 'paid'`,
      [req.user.id, customer?.email || ""]);
    const recentServices = query(`SELECT wo.id, wo.order_number, wo.status, wo.created_at, wo.service_type
      FROM work_orders wo WHERE wo.customer_id = ? OR wo.customer_email = ? ORDER BY wo.created_at DESC LIMIT 5`,
      [req.user.id, customer?.email || ""]);
    const recentPurchases = query("SELECT * FROM store_orders WHERE customer_id = ? OR customer_email = ? ORDER BY created_at DESC LIMIT 5",
      [req.user.id, customer?.email || ""]);
    success(res, {
      vehicles: vehicles?.count || 0,
      activeServices: activeServices?.count || 0,
      purchases: purchases?.count || 0,
      pendingInvoices: pendingInvoices?.count || 0,
      recentServices,
      recentPurchases,
    });
  } catch (err) { console.error(err); error(res, "Error al obtener estadísticas", 500); }
});

// --- SETTINGS ---
router.get("/settings", (req, res) => {
  try {
    const settings = get("SELECT * FROM customer_settings WHERE customer_id = ?", [req.user.id]) || {};
    success(res, settings);
  } catch (err) { console.error(err); error(res, "Error al obtener configuración", 500); }
});

router.put("/settings", (req, res) => {
  try {
    const { language, timezone, email_notifications, push_notifications, sms_notifications, marketing_emails } = req.body;
    const exists = get("SELECT id FROM customer_settings WHERE customer_id = ?", [req.user.id]);
    if (exists) {
      run("UPDATE customer_settings SET language = COALESCE(?, language), timezone = COALESCE(?, timezone), email_notifications = COALESCE(?, email_notifications), push_notifications = COALESCE(?, push_notifications), sms_notifications = COALESCE(?, sms_notifications), marketing_emails = COALESCE(?, marketing_emails) WHERE customer_id = ?",
        [language, timezone, email_notifications, push_notifications, sms_notifications, marketing_emails, req.user.id]);
    } else {
      const id = generateId();
      run("INSERT INTO customer_settings (id, customer_id, language, timezone, email_notifications, push_notifications, sms_notifications, marketing_emails) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, req.user.id, language || "es", timezone || "America/Bogota", email_notifications ? 1 : 0, push_notifications ? 1 : 0, sms_notifications ? 1 : 0, marketing_emails ? 1 : 0]);
    }
    success(res, null, "Configuración guardada");
  } catch (err) { console.error(err); error(res, "Error al guardar configuración", 500); }
});

module.exports = router;
