const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { notifyAdmin, sendMail } = require("../utils/notifications");

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const count = get("SELECT COUNT(*) as c FROM work_orders");
  const num = (count?.c || 0) + 1;
  return `MP-${year}-${String(num).padStart(6, "0")}`;
}

function addTimeline(workOrderId, status, description, userId) {
  run("INSERT INTO work_order_timeline (id, work_order_id, status, description, created_by) VALUES (?, ?, ?, ?, ?)",
    [generateId(), workOrderId, status, description, userId || "system"]);
}

function sendStatusEmail(order, newStatus, label) {
  if (!order.customer_email) return;
  const statusLabels = { received: "Recibido", diagnosed: "Diagnosticado", quoted: "Cotizado", approved: "Aprobado", in_progress: "En reparación", quality_check: "Control de calidad", ready: "Listo para entregar", delivered: "Entregado", cancelled: "Cancelado" };
  sendMail({ to: order.customer_email, subject: `Orden ${order.order_number} - ${label || statusLabels[newStatus] || newStatus}`,
    html: `<h2>Hola ${order.customer_name}</h2><p>El estado de tu orden <b>${order.order_number}</b> ha cambiado:</p><p style="font-size:18px;font-weight:bold;color:#14B8A6">${statusLabels[newStatus] || newStatus}</p>` });
}

// List all work orders with filtering, pagination, search
exports.list = (req, res) => {
  const { status, mechanic_id, priority, search, page, limit } = req.query;
  let where = "";
  const params = [];
  const conditions = [];

  if (status) { conditions.push("wo.status = ?"); params.push(status); }
  if (mechanic_id) { conditions.push("wo.assigned_to = ?"); params.push(mechanic_id); }
  if (priority) { conditions.push("wo.priority = ?"); params.push(priority); }
  if (search) {
    conditions.push("(wo.order_number LIKE ? OR wo.customer_name LIKE ? OR wo.customer_phone LIKE ? OR wo.vehicle_description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (conditions.length) where = " WHERE " + conditions.join(" AND ");

  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = get(`SELECT COUNT(*) as total FROM work_orders wo${where}`, params);
    const total = countRow?.total || 0;
    const data = query(`SELECT wo.*, tm.name as mechanic_name FROM work_orders wo LEFT JOIN team_members tm ON wo.assigned_to = tm.id${where} ORDER BY wo.created_at DESC LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }

  const data = query(`SELECT wo.*, tm.name as mechanic_name FROM work_orders wo LEFT JOIN team_members tm ON wo.assigned_to = tm.id${where} ORDER BY wo.created_at DESC`, params);
  success(res, data);
};

// Get single work order with all related data
exports.getById = (req, res) => {
  const order = get("SELECT wo.*, tm.name as mechanic_name FROM work_orders wo LEFT JOIN team_members tm ON wo.assigned_to = tm.id WHERE wo.id = ?", [req.params.id]);
  if (!order) return error(res, "Orden no encontrada", 404);

  order.diagnostic = get("SELECT * FROM diagnostics WHERE work_order_id = ?", [order.id]);
  order.quotes = query("SELECT * FROM quotes WHERE work_order_id = ? ORDER BY created_at DESC", [order.id]);
  order.parts = query("SELECT * FROM work_order_parts WHERE work_order_id = ? ORDER BY created_at DESC", [order.id]);
  order.timeline = query("SELECT * FROM work_order_timeline WHERE work_order_id = ? ORDER BY created_at ASC", [order.id]);
  order.photos = query("SELECT * FROM work_order_photos WHERE work_order_id = ? ORDER BY created_at DESC", [order.id]);
  order.checklist = query("SELECT * FROM work_order_checklist WHERE work_order_id = ? ORDER BY created_at ASC", [order.id]);

  if (order.vehicle_id) {
    order.vehicle = get("SELECT * FROM vehicles WHERE id = ?", [order.vehicle_id]);
    if (order.vehicle) {
      order.vehicle.photos = query("SELECT * FROM vehicle_photos WHERE vehicle_id = ? ORDER BY created_at DESC", [order.vehicle.id]);
      order.vehicle.documents = query("SELECT * FROM vehicle_documents WHERE vehicle_id = ?", [order.vehicle.id]);
      const lastMileage = get("SELECT * FROM vehicle_mileage WHERE vehicle_id = ? ORDER BY recorded_at DESC LIMIT 1", [order.vehicle.id]);
      order.vehicle.current_mileage = lastMileage?.mileage || order.vehicle.mileage || 0;
    }
  }
  if (order.customer_id) {
    order.customer = get("SELECT * FROM customers WHERE id = ?", [order.customer_id]);
  }

  success(res, order);
};

// Create new work order (reception flow)
exports.create = (req, res) => {
  const {
    customer_id, customer_name, customer_phone, customer_email,
    vehicle_id, vehicle_description, service_type, description,
    priority, assigned_to, reception_photos, reception_observations,
    reception_mileage, estimated_completion
  } = req.body;
  if (!customer_name) return error(res, "Nombre del cliente requerido", 400);

  const id = generateId();
  const order_number = generateOrderNumber();

  run(`INSERT INTO work_orders (id, order_number, customer_id, customer_name, customer_phone, customer_email, vehicle_id, vehicle_description, service_type, description, status, priority, assigned_to, reception_photos, reception_observations, reception_mileage, estimated_completion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, ?, ?, ?, ?, ?)`,
    [id, order_number, customer_id || null, customer_name, customer_phone || "", customer_email || "",
     vehicle_id || null, vehicle_description || "", service_type || "", description || "",
     priority || "normal", assigned_to || null,
     JSON.stringify(reception_photos || []), reception_observations || "", reception_mileage || 0,
     estimated_completion || null]);

  addTimeline(id, "received", "Orden de trabajo creada", req.user?.id || "system");

  // Create default checklist items
  const defaultChecklist = [
    "Documentos del vehículo verificados",
    "Fotos de recepción tomadas",
    "Kilometraje registrado",
    "Accesorios del cliente identificados",
    "Nivel de combustible verificado",
    "Estado general documentado"
  ];
  defaultChecklist.forEach(item => {
    run("INSERT INTO work_order_checklist (id, work_order_id, item) VALUES (?, ?, ?)", [generateId(), id, item]);
  });

  if (customer_email) {
    sendMail({ to: customer_email, subject: `Orden de trabajo ${order_number} creada`,
      html: `<h1>Hola ${customer_name}</h1><p>Tu orden de trabajo <b>${order_number}</b> ha sido creada exitosamente.</p><p>Servicio: ${service_type || "General"}</p><p>Puedes consultar el estado en: <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/estado-servicio?id=${order_number}">Estado del servicio</a></p>` });
  }
  notifyAdmin("Nueva orden de trabajo", `<p><b>Orden:</b> ${order_number}<br><b>Cliente:</b> ${customer_name}<br><b>Servicio:</b> ${service_type || "General"}</p>`);

  success(res, { id, order_number }, "Orden creada", 201);
};

// Update basic work order fields
exports.update = (req, res) => {
  const { status, priority, assigned_to, estimated_completion, description, service_type } = req.body;
  const existing = get("SELECT id, status, customer_name, customer_email, order_number FROM work_orders WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Orden no encontrada", 404);

  run(`UPDATE work_orders SET
    status = COALESCE(?, status),
    priority = COALESCE(?, priority),
    assigned_to = COALESCE(?, assigned_to),
    estimated_completion = COALESCE(?, estimated_completion),
    description = COALESCE(?, description),
    service_type = COALESCE(?, service_type),
    updated_at = datetime('now')
    WHERE id = ?`,
    [status || null, priority || null, assigned_to || null, estimated_completion || null,
     description || null, service_type || null, req.params.id]);

  if (status && status !== existing.status) {
    addTimeline(req.params.id, status, `Estado cambiado a: ${status}`, req.user?.id || "system");
    sendStatusEmail(existing, status);
  }
  success(res, null, "Orden actualizada");
};

// Delete work order
exports.remove = (req, res) => {
  const existing = get("SELECT id FROM work_orders WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Orden no encontrada", 404);
  run("DELETE FROM work_orders WHERE id = ?", [req.params.id]);
  success(res, null, "Orden eliminada");
};

// Search work orders
exports.search = (req, res) => {
  const { q } = req.query;
  if (!q) return error(res, "Parámetro de búsqueda requerido", 400);
  const results = query("SELECT * FROM work_orders WHERE order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR vehicle_description LIKE ? ORDER BY created_at DESC LIMIT 20",
    [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);
  success(res, results);
};

// === RECEPTION ===
exports.reception = (req, res) => {
  const order = get("SELECT id, status FROM work_orders WHERE id = ?", [req.params.id]);
  if (!order) return error(res, "Orden no encontrada", 404);

  const { reception_photos, reception_observations, reception_mileage } = req.body;
  run(`UPDATE work_orders SET
    reception_photos = COALESCE(?, reception_photos),
    reception_observations = COALESCE(?, reception_observations),
    reception_mileage = COALESCE(?, reception_mileage),
    updated_at = datetime('now') WHERE id = ?`,
    [JSON.stringify(reception_photos), reception_observations, reception_mileage, req.params.id]);

  success(res, null, "Recepción actualizada");
};

// === DIAGNOSIS ===
exports.updateDiagnostic = (req, res) => {
  const order = get("SELECT id, status FROM work_orders WHERE id = ?", [req.params.id]);
  if (!order) return error(res, "Orden no encontrada", 404);

  const { findings, recommendations, urgency, estimated_cost, estimated_days, mechanic_id } = req.body;
  const existing = get("SELECT id FROM diagnostics WHERE work_order_id = ?", [req.params.id]);

  if (existing) {
    run(`UPDATE diagnostics SET findings = COALESCE(?, findings), recommendations = COALESCE(?, recommendations),
      urgency = COALESCE(?, urgency), estimated_cost = COALESCE(?, estimated_cost),
      estimated_days = COALESCE(?, estimated_days), mechanic_id = COALESCE(?, mechanic_id),
      updated_at = datetime('now') WHERE work_order_id = ?`,
      [findings, recommendations, urgency, estimated_cost, estimated_days, mechanic_id, req.params.id]);
  } else {
    run(`INSERT INTO diagnostics (id, work_order_id, mechanic_id, findings, recommendations, urgency, estimated_cost, estimated_days)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [generateId(), req.params.id, mechanic_id || null, findings || "", recommendations || "",
       urgency || "normal", estimated_cost || 0, estimated_days || 0]);
  }

  if (order.status === "received") {
    run("UPDATE work_orders SET status = 'diagnosed', updated_at = datetime('now') WHERE id = ?", [req.params.id]);
    addTimeline(req.params.id, "diagnosed", "Diagnóstico completado", req.user?.id || "system");
  }

  success(res, null, "Diagnóstico guardado");
};

// === QUOTES ===
exports.createQuote = (req, res) => {
  const order = get("SELECT id, status, customer_name, customer_email, order_number FROM work_orders WHERE id = ?", [req.params.id]);
  if (!order) return error(res, "Orden no encontrada", 404);

  const { items, labor_cost, parts_cost, discount, notes, valid_until, tax_rate } = req.body;
  const quoteId = generateId();
  const year = new Date().getFullYear();
  const count = get("SELECT COUNT(*) as c FROM quotes");
  const quote_number = `COT-${year}-${String((count?.c || 0) + 1).padStart(6, "0")}`;

  const subtotal = (labor_cost || 0) + (parts_cost || 0);
  const tax = subtotal * ((tax_rate || 0) / 100);
  const total = subtotal + tax - (discount || 0);

  run(`INSERT INTO quotes (id, quote_number, work_order_id, customer_id, customer_name, customer_email,
    items, labor_cost, parts_cost, subtotal, tax_rate, tax_amount, discount, total, notes, valid_until, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [quoteId, quote_number, req.params.id, order.customer_id || null, order.customer_name,
     order.customer_email || "", JSON.stringify(items || []), labor_cost || 0, parts_cost || 0,
     subtotal, tax_rate || 0, tax, discount || 0, total, notes || "", valid_until || null]);

  run("UPDATE work_orders SET status = 'quoted', updated_at = datetime('now') WHERE id = ?", [req.params.id]);
  addTimeline(req.params.id, "quoted", `Cotización ${quote_number} creada - Total: $${total.toFixed(2)}`, req.user?.id || "system");

  if (order.customer_email) {
    sendMail({ to: order.customer_email, subject: `Cotización ${quote_number} - Orden ${order.order_number}`,
      html: `<h2>Hola ${order.customer_name}</h2><p>Se ha generado la cotización <b>${quote_number}</b> para tu orden <b>${order.order_number}</b>.</p><p><b>Total:</b> $${total.toFixed(2)}</p><p>Revisa los detalles en el portal del cliente.</p>` });
  }

  success(res, { id: quoteId, quote_number }, "Cotización creada", 201);
};

exports.approveQuote = (req, res) => {
  const quote = get("SELECT q.*, wo.customer_email, wo.customer_name, wo.order_number FROM quotes q JOIN work_orders wo ON q.work_order_id = wo.id WHERE q.id = ?", [req.params.quoteId]);
  if (!quote) return error(res, "Cotización no encontrada", 404);

  run("UPDATE quotes SET status = 'approved', approved_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", [req.params.quoteId]);
  run("UPDATE work_orders SET status = 'approved', subtotal = ?, tax_amount = ?, total = ?, updated_at = datetime('now') WHERE id = ?",
    [quote.subtotal, quote.tax_amount, quote.total, quote.work_order_id]);
  addTimeline(quote.work_order_id, "approved", `Cotización ${quote.quote_number} aprobada por el cliente`, req.user?.id || "system");

  if (quote.customer_email) {
    sendMail({ to: quote.customer_email, subject: `Cotización ${quote.quote_number} aprobada`,
      html: `<h2>Hola ${quote.customer_name}</h2><p>Tu cotización <b>${quote.quote_number}</b> ha sido aprobada.</p><p>Procederemos con las reparaciones de la orden <b>${quote.order_number}</b>.</p>` });
  }
  success(res, null, "Cotización aprobada");
};

exports.rejectQuote = (req, res) => {
  const quote = get("SELECT q.*, wo.customer_email, wo.customer_name FROM quotes q JOIN work_orders wo ON q.work_order_id = wo.id WHERE q.id = ?", [req.params.quoteId]);
  if (!quote) return error(res, "Cotización no encontrada", 404);

  const { rejection_reason } = req.body;
  run("UPDATE quotes SET status = 'rejected', rejected_at = datetime('now'), rejection_reason = ?, updated_at = datetime('now') WHERE id = ?",
    [rejection_reason || "", req.params.quoteId]);
  addTimeline(quote.work_order_id, "quoted", `Cotización ${quote.quote_number} rechazada: ${rejection_reason || "Sin motivo"}`, req.user?.id || "system");

  if (quote.customer_email) {
    sendMail({ to: quote.customer_email, subject: `Cotización ${quote.quote_number} rechazada`,
      html: `<h2>Hola ${quote.customer_name}</h2><p>Tu cotización <b>${quote.quote_number}</b> ha sido rechazada.</p>${rejection_reason ? `<p><b>Motivo:</b> ${rejection_reason}</p>` : ""}` });
  }
  success(res, null, "Cotización rechazada");
};

// === REPAIR / IN PROGRESS ===
exports.startRepair = (req, res) => {
  const order = get("SELECT id, status FROM work_orders WHERE id = ?", [req.params.id]);
  if (!order) return error(res, "Orden no encontrada", 404);

  const { assigned_to } = req.body;
  run("UPDATE work_orders SET status = 'in_progress', assigned_to = COALESCE(?, assigned_to), updated_at = datetime('now') WHERE id = ?",
    [assigned_to || null, req.params.id]);
  addTimeline(req.params.id, "in_progress", "Reparación iniciada", req.user?.id || "system");
  success(res, null, "Reparación iniciada");
};

exports.addPart = (req, res) => {
  const order = get("SELECT id FROM work_orders WHERE id = ?", [req.params.id]);
  if (!order) return error(res, "Orden no encontrada", 404);

  const { product_id, name, quantity, unit_price } = req.body;
  if (!name) return error(res, "Nombre del repuesto requerido", 400);

  const total = (quantity || 1) * (unit_price || 0);
  run("INSERT INTO work_order_parts (id, work_order_id, product_id, name, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [generateId(), req.params.id, product_id || null, name, quantity || 1, unit_price || 0, total]);

  // Update work order totals
  const parts = get("SELECT COALESCE(SUM(total), 0) as parts_total FROM work_order_parts WHERE work_order_id = ?", [req.params.id]);
  run("UPDATE work_orders SET subtotal = ?, updated_at = datetime('now') WHERE id = ?", [parts.parts_total, req.params.id]);

  success(res, null, "Repuesto agregado", 201);
};

exports.removePart = (req, res) => {
  const part = get("SELECT id, work_order_id FROM work_order_parts WHERE id = ?", [req.params.partId]);
  if (!part) return error(res, "Repuesto no encontrado", 404);

  run("DELETE FROM work_order_parts WHERE id = ?", [req.params.partId]);
  const parts = get("SELECT COALESCE(SUM(total), 0) as parts_total FROM work_order_parts WHERE work_order_id = ?", [part.work_order_id]);
  run("UPDATE work_orders SET subtotal = ?, updated_at = datetime('now') WHERE id = ?", [parts.parts_total, part.work_order_id]);
  success(res, null, "Repuesto eliminado");
};

// === QUALITY CHECK ===
exports.qualityCheck = (req, res) => {
  const order = get("SELECT id, status FROM work_orders WHERE id = ?", [req.params.id]);
  if (!order) return error(res, "Orden no encontrada", 404);

  const { checklist, qc_completed_by } = req.body;
  if (checklist) {
    // Update existing checklist items
    checklist.forEach(item => {
      if (item.id) {
        run("UPDATE work_order_checklist SET checked = ?, checked_by = ?, checked_at = datetime('now') WHERE id = ?",
          [item.checked ? 1 : 0, qc_completed_by || "", item.id]);
      }
    });
  }

  const allChecked = get("SELECT COUNT(*) as total, SUM(CASE WHEN checked = 1 THEN 1 ELSE 0 END) as checked FROM work_order_checklist WHERE work_order_id = ?", [req.params.id]);
  const allDone = allChecked.total > 0 && allChecked.total === allChecked.checked;

  if (allDone) {
    run("UPDATE work_orders SET status = 'quality_check', qc_completed_by = ?, qc_completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
      [qc_completed_by || "", req.params.id]);
    addTimeline(req.params.id, "quality_check", "Control de calidad completado - Todos los items verificados", req.user?.id || "system");
  }

  success(res, { all_done: allDone }, "Control de calidad actualizado");
};

// === DELIVERY ===
exports.deliver = (req, res) => {
  const existing = get("SELECT id, status, customer_name, customer_email, order_number, total FROM work_orders WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Orden no encontrada", 404);
  if (existing.status === "delivered") return error(res, "La orden ya fue entregada", 400);

  const { delivery_signature, delivery_notes } = req.body;
  run("UPDATE work_orders SET status = 'delivered', actual_completion = datetime('now'), delivery_signature = COALESCE(?, delivery_signature), delivery_notes = COALESCE(?, delivery_notes), updated_at = datetime('now') WHERE id = ?",
    [delivery_signature || null, delivery_notes || null, req.params.id]);
  addTimeline(req.params.id, "delivered", "Moto entregada al cliente", req.user?.id || "system");

  // Create warranty if configured
  const warrantyDays = get("SELECT value FROM site_config WHERE key = 'default_warranty_days'");
  const days = parseInt(warrantyDays?.value) || 15;
  const startDate = new Date().toISOString().split("T")[0];
  const endDate = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

  run(`INSERT INTO warranties (id, entity_type, entity_id, customer_id, customer_name, customer_email, customer_phone,
    service_name, duration_days, start_date, end_date, terms, status)
    VALUES (?, 'work_order', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [generateId(), req.params.id, existing.customer_id || null, existing.customer_name,
     existing.customer_email || "", "", existing.service_type || "", days, startDate, endDate,
     `Garantía de ${days} días por servicio realizado en ${existing.order_number}`]);

  if (existing.customer_email) {
    sendMail({ to: existing.customer_email, subject: `Orden ${existing.order_number} - Entregada`,
      html: `<h2>Hola ${existing.customer_name}</h2><p>Tu orden <b>${existing.order_number}</b> ha sido entregada exitosamente.</p><p>Tienes una garantía de <b>${days} días</b>.</p><p>Gracias por confiar en MotoPro.</p>` });
  }
  success(res, null, "Orden marcada como entregada");
};

// === TIMELINE ===
exports.addTimelineEvent = (req, res) => {
  const order = get("SELECT id FROM work_orders WHERE id = ?", [req.params.id]);
  if (!order) return error(res, "Orden no encontrada", 404);

  const { status, description, image } = req.body;
  if (!status || !description) return error(res, "Estado y descripción requeridos", 400);

  run("INSERT INTO work_order_timeline (id, work_order_id, status, description, image, created_by) VALUES (?, ?, ?, ?, ?, ?)",
    [generateId(), req.params.id, status, description, image || null, req.user?.id || "system"]);
  success(res, null, "Evento agregado al timeline", 201);
};

// === STATUS UPDATE (generic) ===
exports.updateStatus = (req, res) => {
  const existing = get("SELECT id, status, customer_name, customer_email, order_number FROM work_orders WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Orden no encontrada", 404);

  const { status } = req.body;
  if (!status) return error(res, "Estado requerido", 400);

  run("UPDATE work_orders SET status = ?, updated_at = datetime('now') WHERE id = ?", [status, req.params.id]);
  addTimeline(req.params.id, status, `Estado cambiado a: ${status}`, req.user?.id || "system");
  sendStatusEmail(existing, status);

  success(res, null, "Estado actualizado");
};

// Legacy compatibility exports
exports.listServiceRequests = exports.list;
exports.getServiceRequest = exports.getById;
exports.createServiceRequest = (req, res) => {
  req.body.customer_name = req.body.name;
  req.body.customer_phone = req.body.phone;
  req.body.customer_email = req.body.email;
  req.body.vehicle_description = [req.body.brand_model, req.body.plate].filter(Boolean).join(" - ");
  exports.create(req, res);
};
exports.updateServiceRequest = exports.update;
exports.removeServiceRequest = exports.remove;
