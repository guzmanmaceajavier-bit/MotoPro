const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { notifyAdmin, sendMail } = require("../utils/notifications");

function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const count = get("SELECT COUNT(*) as c FROM quotes");
  const num = (count?.c || 0) + 1;
  return `COT-${year}-${String(num).padStart(6, "0")}`;
}

exports.list = (req, res) => {
  const { status, work_order_id, page, limit } = req.query;
  let where = "";
  const params = [];
  const conditions = [];
  if (status) { conditions.push("status = ?"); params.push(status); }
  if (work_order_id) { conditions.push("work_order_id = ?"); params.push(work_order_id); }
  if (conditions.length) where = " WHERE " + conditions.join(" AND ");

  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = query(`SELECT COUNT(*) as total FROM quotes${where}`, params);
    const total = countRow[0]?.total || 0;
    const data = query(`SELECT * FROM quotes${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }

  const data = query(`SELECT * FROM quotes${where} ORDER BY created_at DESC`, params);
  success(res, data);
};

exports.getById = (req, res) => {
  const quote = get("SELECT * FROM quotes WHERE id = ?", [req.params.id]);
  if (!quote) return error(res, "Cotización no encontrada", 404);
  quote.items = JSON.parse(quote.items || "[]");
  if (quote.work_order_id) {
    quote.work_order = get("SELECT id, order_number, customer_name, vehicle_description FROM work_orders WHERE id = ?", [quote.work_order_id]);
  }
  success(res, quote);
};

exports.create = (req, res) => {
  const { work_order_id, items, labor_cost, parts_cost, tax_rate, discount, notes, valid_until } = req.body;
  if (!work_order_id) return error(res, "work_order_id requerido", 400);

  const workOrder = get("SELECT id, customer_name, customer_email, customer_id FROM work_orders WHERE id = ?", [work_order_id]);
  if (!workOrder) return error(res, "Orden de trabajo no encontrada", 404);

  const id = generateId();
  const quote_number = generateQuoteNumber();
  const parsedItems = Array.isArray(items) ? items : [];
  const partsTotal = parsedItems.reduce((sum, item) => sum + (item.total || (item.quantity || 1) * (item.unit_price || 0)), 0);
  const subtotal = partsTotal + (labor_cost || 0);
  const taxAmount = subtotal * ((tax_rate || 0) / 100);
  const total = subtotal + taxAmount - (discount || 0);

  run(`INSERT INTO quotes (id, quote_number, work_order_id, customer_id, customer_name, customer_email, items, labor_cost, parts_cost, subtotal, tax_rate, tax_amount, discount, total, notes, valid_until, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [id, quote_number, work_order_id, workOrder.customer_id || null, workOrder.customer_name, workOrder.customer_email || "",
     JSON.stringify(parsedItems), labor_cost || 0, partsTotal, subtotal, tax_rate || 0, taxAmount, discount || 0, total, notes || "", valid_until || null]);

  run("UPDATE work_orders SET status = 'quoted', updated_at = datetime('now') WHERE id = ?", [work_order_id]);
  run("INSERT INTO work_order_timeline (id, work_order_id, status, description, created_by) VALUES (?, ?, 'quoted', ?, ?)",
    [generateId(), work_order_id, `Cotización ${quote_number} generada - Total: $${total.toLocaleString()}`, req.user?.id || "system"]);

  if (workOrder.customer_email) {
    sendMail({ to: workOrder.customer_email, subject: `Nueva cotización ${quote_number}`,
      html: `<h2>Hola ${workOrder.customer_name}</h2><p>Se ha generado una cotización para tu orden de trabajo.</p><p><b>Número:</b> ${quote_number}<br><b>Total:</b> $${total.toLocaleString()}</p><p>Puedes revisarla en tu portal de cliente.</p>`
    });
  }
  notifyAdmin("Nueva cotización", `<p><b>Cotización:</b> ${quote_number}<br><b>Cliente:</b> ${workOrder.customer_name}<br><b>Total:</b> $${total.toLocaleString()}</p>`);

  success(res, { id, quote_number }, "Cotización creada", 201);
};

exports.update = (req, res) => {
  const { items, labor_cost, tax_rate, discount, notes, valid_until } = req.body;
  const existing = get("SELECT id FROM quotes WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Cotización no encontrada", 404);

  const parsedItems = Array.isArray(items) ? items : [];
  const partsTotal = parsedItems.reduce((sum, item) => sum + (item.total || (item.quantity || 1) * (item.unit_price || 0)), 0);
  const subtotal = partsTotal + (labor_cost || 0);
  const taxAmount = subtotal * ((tax_rate || 0) / 100);
  const total = subtotal + taxAmount - (discount || 0);

  run(`UPDATE quotes SET items = ?, labor_cost = ?, parts_cost = ?, subtotal = ?, tax_rate = ?, tax_amount = ?, discount = ?, total = ?, notes = ?, valid_until = ?, updated_at = datetime('now') WHERE id = ?`,
    [JSON.stringify(parsedItems), labor_cost || 0, partsTotal, subtotal, tax_rate || 0, taxAmount, discount || 0, total, notes || "", valid_until || null, req.params.id]);

  success(res, null, "Cotización actualizada");
};

exports.send = (req, res) => {
  const quote = get("SELECT * FROM quotes WHERE id = ?", [req.params.id]);
  if (!quote) return error(res, "Cotización no encontrada", 404);
  if (quote.status !== "pending") return error(res, "Solo se pueden enviar cotizaciones pendientes", 400);

  run("UPDATE quotes SET status = 'sent', updated_at = datetime('now') WHERE id = ?", [req.params.id]);

  if (quote.customer_email) {
    sendMail({ to: quote.customer_email, subject: `Cotización ${quote.quote_number} - Pendiente de aprobación`,
      html: `<h2>Hola ${quote.customer_name}</h2><p>Tu cotización <b>${quote.quote_number}</b> está lista para ser revisada.</p><p><b>Total:</b> $${quote.total.toLocaleString()}</p><p>Ingresa a tu portal para aprobar o rechazar la cotización.</p>`
    });
  }
  success(res, null, "Cotización enviada");
};

exports.approve = (req, res) => {
  const quote = get("SELECT * FROM quotes WHERE id = ?", [req.params.id]);
  if (!quote) return error(res, "Cotización no encontrada", 404);
  if (!["pending", "sent"].includes(quote.status)) return error(res, "No se puede aprobar esta cotización", 400);

  run("UPDATE quotes SET status = 'approved', approved_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", [req.params.id]);
  run("UPDATE work_orders SET status = 'approved', updated_at = datetime('now') WHERE id = ?", [quote.work_order_id]);
  run("INSERT INTO work_order_timeline (id, work_order_id, status, description, created_by) VALUES (?, ?, 'approved', ?, ?)",
    [generateId(), quote.work_order_id, `Cotización ${quote.quote_number} aprobada por el cliente`, req.user?.id || "system"]);

  notifyAdmin("Cotización aprobada", `<p><b>Cotización:</b> ${quote.quote_number}<br><b>Cliente:</b> ${quote.customer_name}<br><b>Total:</b> $${quote.total.toLocaleString()}</p>`);
  success(res, null, "Cotización aprobada");
};

exports.reject = (req, res) => {
  const quote = get("SELECT * FROM quotes WHERE id = ?", [req.params.id]);
  if (!quote) return error(res, "Cotización no encontrada", 404);
  if (!["pending", "sent"].includes(quote.status)) return error(res, "No se puede rechazar esta cotización", 400);

  const { rejection_reason } = req.body;
  run("UPDATE quotes SET status = 'rejected', rejected_at = datetime('now'), rejection_reason = ?, updated_at = datetime('now') WHERE id = ?", [rejection_reason || "", req.params.id]);
  run("UPDATE work_orders SET status = 'diagnosed', updated_at = datetime('now') WHERE id = ?", [quote.work_order_id]);
  run("INSERT INTO work_order_timeline (id, work_order_id, status, description, created_by) VALUES (?, ?, 'diagnosed', ?, ?)",
    [generateId(), quote.work_order_id, `Cotización ${quote.quote_number} rechazada. Motivo: ${rejection_reason || "No especificado"}`, req.user?.id || "system"]);

  notifyAdmin("Cotización rechazada", `<p><b>Cotización:</b> ${quote.quote_number}<br><b>Cliente:</b> ${quote.customer_name}<br><b>Motivo:</b> ${rejection_reason || "No especificado"}</p>`);
  success(res, null, "Cotización rechazada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM quotes WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Cotización no encontrada", 404);
  run("DELETE FROM quotes WHERE id = ?", [req.params.id]);
  success(res, null, "Cotización eliminada");
};
