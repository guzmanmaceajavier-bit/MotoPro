const { get, query } = require("../config/database");
const { success, error } = require("../utils/helpers");

exports.exportInvoice = (req, res) => {
  try {
    const invoice = get("SELECT * FROM invoices WHERE id = ?", [req.params.id]);
    if (!invoice) return error(res, "Factura no encontrada", 404);
    const items = query("SELECT * FROM invoice_items WHERE invoice_id = ?", [req.params.id]);
    res.setHeader("Content-Type", "text/html");
    res.send(generateInvoiceHTML(invoice, items));
  } catch (err) {
    console.error(err);
    error(res, "Error al exportar factura", 500);
  }
};

exports.exportQuote = (req, res) => {
  try {
    const quote = get("SELECT * FROM quotes WHERE id = ?", [req.params.id]);
    if (!quote) return error(res, "Cotización no encontrada", 404);
    const items = query("SELECT * FROM quote_items WHERE quote_id = ?", [req.params.id]);
    res.setHeader("Content-Type", "text/html");
    res.send(generateQuoteHTML(quote, items));
  } catch (err) {
    console.error(err);
    error(res, "Error al exportar cotización", 500);
  }
};

function generateInvoiceHTML(invoice, items) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Factura #${invoice.id?.slice(0,8)}</title><style>
    body{font-family:Arial,sans-serif;margin:40px;color:#333}
    h1{color:#FF6B00;border-bottom:2px solid #FF6B00;padding-bottom:10px}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th{background:#f5f5f5;text-align:left;padding:10px;border-bottom:2px solid #ddd}
    td{padding:10px;border-bottom:1px solid #eee}
    .total{font-size:18px;font-weight:bold;text-align:right;margin-top:20px}
    .footer{margin-top:40px;font-size:12px;color:#999;text-align:center}
  </style></head><body>
    <h1>MotoPro Taller</h1>
    <h2>Factura #${invoice.id?.slice(0,8).toUpperCase()}</h2>
    <p>Fecha: ${invoice.created_at || new Date().toLocaleDateString()}</p>
    <p>Cliente: ${invoice.customer_name || "N/A"}</p>
    ${invoice.customer_document ? `<p>NIT/CC: ${invoice.customer_document}</p>` : ""}
    <table><thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>
      ${items.map(i => `<tr><td>${i.name || i.description}</td><td>${i.quantity || 1}</td><td>$${Number(i.price || 0).toLocaleString()}</td><td>$${Number((i.quantity || 1) * (i.price || 0)).toLocaleString()}</td></tr>`).join("")}
    </tbody></table>
    <div class="total">Total: $${Number(invoice.total || 0).toLocaleString()}</div>
    <div class="footer">MotoPro Taller - www.tallermotos.com</div>
  </body></html>`;
}

function generateQuoteHTML(quote, items) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cotización #${quote.id?.slice(0,8)}</title><style>
    body{font-family:Arial,sans-serif;margin:40px;color:#333}
    h1{color:#FF6B00;border-bottom:2px solid #FF6B00;padding-bottom:10px}
    .badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:bold}
    .pending{background:#fef3c7;color:#92400e}.approved{background:#d1fae5;color:#065f46}.rejected{background:#fee2e2;color:#991b1b}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th{background:#f5f5f5;text-align:left;padding:10px;border-bottom:2px solid #ddd}
    td{padding:10px;border-bottom:1px solid #eee}
    .total{font-size:18px;font-weight:bold;text-align:right;margin-top:20px}
    .footer{margin-top:40px;font-size:12px;color:#999;text-align:center}
  </style></head><body>
    <h1>MotoPro Taller</h1>
    <h2>Cotización #${quote.id?.slice(0,8).toUpperCase()}</h2>
    <p>Estado: <span class="badge ${quote.status || 'pending'}">${quote.status || 'Pendiente'}</span></p>
    <p>Fecha: ${quote.created_at || new Date().toLocaleDateString()}</p>
    ${quote.customer_name ? `<p>Cliente: ${quote.customer_name}</p>` : ""}
    <table><thead><tr><th>Producto/Servicio</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>
      ${items.map(i => `<tr><td>${i.name || i.description}</td><td>${i.quantity || 1}</td><td>$${Number(i.price || 0).toLocaleString()}</td><td>$${Number((i.quantity || 1) * (i.price || 0)).toLocaleString()}</td></tr>`).join("")}
    </tbody></table>
    ${quote.discount ? `<p>Descuento: -$${Number(quote.discount).toLocaleString()}</p>` : ""}
    ${quote.tax ? `<p>Impuesto: $${Number(quote.tax).toLocaleString()}</p>` : ""}
    <div class="total">Total: $${Number(quote.total || 0).toLocaleString()}</div>
    <div class="footer">MotoPro Taller - www.tallermotos.com</div>
  </body></html>`;
}
