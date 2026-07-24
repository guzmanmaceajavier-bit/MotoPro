const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { status, customer_id, order_id, page, limit } = req.query;
  let sql = "SELECT * FROM invoices";
  const conditions = [];
  const params = [];
  if (status) { conditions.push("status = ?"); params.push(status); }
  if (customer_id) { conditions.push("customer_id = ?"); params.push(customer_id); }
  if (order_id) { conditions.push("order_id = ?"); params.push(order_id); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY created_at DESC";
  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = query(`SELECT COUNT(*) as total FROM invoices${conditions.length ? " WHERE " + conditions.join(" AND ") : ""}`, params);
    const total = countRow[0]?.total || 0;
    const data = query(`${sql} LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }
  const data = query(sql, params);
  success(res, data);
};

exports.getById = (req, res) => {
  const invoice = get("SELECT * FROM invoices WHERE id = ?", [req.params.id]);
  if (!invoice) return error(res, "Factura no encontrada", 404);
  if (typeof invoice.items === "string") invoice.items = JSON.parse(invoice.items);
  success(res, invoice);
};

exports.getByOrder = (req, res) => {
  const invoice = get("SELECT * FROM invoices WHERE order_id = ?", [req.params.order_id]);
  if (!invoice) return error(res, "Factura no encontrada para esta orden", 404);
  if (typeof invoice.items === "string") invoice.items = JSON.parse(invoice.items);
  success(res, invoice);
};

exports.create = (req, res) => {
  const { order_id, customer_id, customer_name, customer_email, customer_phone, customer_nit, items, subtotal, tax_name, tax_rate, tax_amount, discount, total, notes, due_date } = req.body;
  if (!order_id || !customer_name || !customer_email) return error(res, "order_id, customer_name y customer_email son requeridos", 400);
  const year = new Date().getFullYear();
  const last = get("SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY created_at DESC LIMIT 1", [`INV-${year}-%`]);
  let seq = 1;
  if (last) {
    seq = parseInt(last.invoice_number.split("-").pop()) + 1;
  }
  const invoice_number = `INV-${year}-${String(seq).padStart(5, "0")}`;
  const id = generateId();
  run(`INSERT INTO invoices (id, order_id, invoice_number, customer_id, customer_name, customer_email, customer_phone, customer_nit, items, subtotal, tax_name, tax_rate, tax_amount, discount, total, notes, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, order_id, invoice_number, customer_id || null, customer_name, customer_email, customer_phone || "", customer_nit || "",
      JSON.stringify(items || []), parseFloat(subtotal) || 0, tax_name || "IVA", parseFloat(tax_rate) || 0,
      parseFloat(tax_amount) || 0, parseFloat(discount) || 0, parseFloat(total) || 0, notes || "", due_date || null]);
  success(res, { id, invoice_number }, "Factura creada", 201);
};

exports.updateStatus = (req, res) => {
  const { status } = req.body;
  const existing = get("SELECT id FROM invoices WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Factura no encontrada", 404);
  const updates = { updated_at: "datetime('now')" };
  const params = [];
  if (status === "paid") {
    run("UPDATE invoices SET status = ?, paid_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", ["paid", req.params.id]);
  } else if (status === "cancelled") {
    run("UPDATE invoices SET status = ?, updated_at = datetime('now') WHERE id = ?", ["cancelled", req.params.id]);
  } else {
    run("UPDATE invoices SET status = COALESCE(?, status), updated_at = datetime('now') WHERE id = ?", [status || null, req.params.id]);
  }
  success(res, null, "Estado de factura actualizado");
};

exports.generatePdf = (req, res) => {
  const invoice = get("SELECT * FROM invoices WHERE id = ?", [req.params.id]);
  if (!invoice) return error(res, "Factura no encontrada", 404);
  const items = typeof invoice.items === "string" ? JSON.parse(invoice.items) : invoice.items;
  const config = {};
  const configRows = query("SELECT key, value FROM site_config");
  configRows.forEach(r => config[r.key] = r.value);
  const itemsHtml = items.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name || item.description || ""}</td><td>${item.quantity || 1}</td><td>$${(parseFloat(item.price) || 0).toFixed(2)}</td><td>$${((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Factura ${invoice.invoice_number}</title>
<style>body{font-family:Arial,sans-serif;margin:40px}h1{color:#333}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f4f4f4}.totals{text-align:right}.total-row{font-weight:bold;font-size:1.1em}</style></head>
<body><h1>Factura ${invoice.invoice_number}</h1>
<p><strong>${config.site_name || "MotoPro Taller"}</strong><br>${config.site_address || ""}<br>${config.site_email || ""}<br>${config.site_phone || ""}</p>
<hr><p><strong>Cliente:</strong> ${invoice.customer_name}<br><strong>Email:</strong> ${invoice.customer_email}<br><strong>Teléfono:</strong> ${invoice.customer_phone || ""}<br><strong>NIT:</strong> ${invoice.customer_nit || ""}</p>
<hr><table><thead><tr><th>#</th><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table>
<p class="totals"><strong>Subtotal:</strong> $${(invoice.subtotal || 0).toFixed(2)}<br>${invoice.tax_name} (${invoice.tax_rate || 0}%): $${(invoice.tax_amount || 0).toFixed(2)}<br><strong>Descuento:</strong> $${(invoice.discount || 0).toFixed(2)}<br><span class="total-row">Total: $${(invoice.total || 0).toFixed(2)}</span></p>
${invoice.notes ? `<p><strong>Notas:</strong> ${invoice.notes}</p>` : ""}
<p style="margin-top:40px;color:#888;font-size:0.9em">Generado el ${new Date().toLocaleDateString()} &mdash; ${config.site_name || "MotoPro"}</p></body></html>`;
  res.set("Content-Type", "text/html");
  res.send(html);
};
