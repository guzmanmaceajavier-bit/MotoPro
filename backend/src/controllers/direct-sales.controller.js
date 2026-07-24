const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

function generateSaleNumber() {
  const year = new Date().getFullYear();
  const count = get("SELECT COUNT(*) as c FROM direct_sales");
  const num = (count?.c || 0) + 1;
  return `VT-${year}-${String(num).padStart(6, "0")}`;
}

exports.list = (req, res) => {
  const { status, search, payment_method, date_from, date_to, page, limit } = req.query;
  let where = "";
  const params = [];
  const conditions = [];
  if (status) { conditions.push("ds.status = ?"); params.push(status); }
  if (payment_method) { conditions.push("ds.payment_method = ?"); params.push(payment_method); }
  if (search) { conditions.push("(ds.sale_number LIKE ? OR ds.customer_name LIKE ? OR ds.customer_phone LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (date_from) { conditions.push("ds.created_at >= ?"); params.push(date_from); }
  if (date_to) { conditions.push("ds.created_at <= ?"); params.push(date_to + " 23:59:59"); }
  if (conditions.length) where = " WHERE " + conditions.join(" AND ");

  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = get(`SELECT COUNT(*) as total FROM direct_sales ds${where}`, params);
    const total = countRow?.total || 0;
    const data = query(`SELECT ds.* FROM direct_sales ds${where} ORDER BY ds.created_at DESC LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }
  success(res, query(`SELECT ds.* FROM direct_sales ds${where} ORDER BY ds.created_at DESC`, params));
};

exports.getById = (req, res) => {
  const sale = get("SELECT * FROM direct_sales WHERE id = ?", [req.params.id]);
  if (!sale) return error(res, "Venta no encontrada", 404);
  sale.items = JSON.parse(sale.items || "[]");
  success(res, sale);
};

exports.create = (req, res) => {
  const {
    customer_name, customer_phone, customer_email, items,
    discount, payment_method, payment_reference, cash_register_id, notes
  } = req.body;
  if (!items || !items.length) return error(res, "Items requeridos", 400);

  const id = generateId();
  const sale_number = generateSaleNumber();

  // Calculate totals
  let subtotal = 0;
  const processedItems = items.map((item) => {
    const lineTotal = (item.quantity || 1) * (item.price || 0);
    subtotal += lineTotal;
    return { ...item, line_total: lineTotal };
  });

  const taxRate = 16; // Default IVA
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - (discount || 0);

  run(`INSERT INTO direct_sales (id, sale_number, customer_name, customer_phone, customer_email,
    items, subtotal, tax_rate, tax_amount, discount, total,
    payment_method, payment_reference, cash_register_id, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, sale_number, customer_name || "Cliente general", customer_phone || "",
     customer_email || "", JSON.stringify(processedItems), subtotal, taxRate, taxAmount,
     discount || 0, total, payment_method || "cash", payment_reference || "",
     cash_register_id || null, notes || "", req.user?.name || "system"]);

  // Update product stock
  processedItems.forEach(item => {
    if (item.product_id) {
      const product = get("SELECT stock FROM products WHERE id = ?", [item.product_id]);
      if (product) {
        run("UPDATE products SET stock = stock - ?, updated_at = datetime('now') WHERE id = ?",
          [item.quantity || 1, item.product_id]);
        run(`INSERT INTO inventory_movements (id, product_id, type, quantity, reference, notes, performed_by)
          VALUES (?, ?, 'out', ?, ?, ?, ?)`,
          [generateId(), item.product_id, item.quantity || 1, `venta_${id}`,
           `Venta ${sale_number}`, req.user?.name || "system"]);
      }
    }
  });

  // Create cash transaction if cash register is provided
  if (cash_register_id) {
    run(`INSERT INTO cash_transactions (id, cash_register_id, type, category, amount, description,
      reference_type, reference_id, payment_method, created_by, customer_name)
      VALUES (?, ?, 'income', 'venta_directa', ?, ?, 'direct_sale', ?, ?, ?, ?)`,
      [generateId(), cash_register_id, total, `Venta ${sale_number} - ${customer_name || "Cliente general"}`,
       id, payment_method || "cash", req.user?.name || "system", customer_name || ""]);
  }

  // Create invoice automatically
  const invoiceId = generateId();
  const year = new Date().getFullYear();
  const invCount = get("SELECT COUNT(*) as c FROM invoices");
  const invoice_number = `INV-${year}-${String((invCount?.c || 0) + 1).padStart(6, "0")}`;

  run(`INSERT INTO invoices (id, order_id, invoice_number, customer_id, customer_name, customer_email,
    customer_phone, items, subtotal, tax_rate, tax_amount, discount, total, status, notes,
    payment_method, cash_register_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?)`,
    [invoiceId, id, invoice_number, null, customer_name || "Cliente general",
     customer_email || "", customer_phone || "", JSON.stringify(processedItems),
     subtotal, taxRate, taxAmount, discount || 0, total,
     `Venta POS ${sale_number}`, payment_method || "cash", cash_register_id || null]);

  success(res, { id, sale_number, total, invoice_number, invoice_id: invoiceId }, "Venta registrada", 201);
};

exports.update = (req, res) => {
  const existing = get("SELECT id FROM direct_sales WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Venta no encontrada", 404);
  const { status, notes } = req.body;
  run("UPDATE direct_sales SET status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = datetime('now') WHERE id = ?",
    [status || null, notes || null, req.params.id]);
  success(res, null, "Venta actualizada");
};

exports.getStats = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const total = get("SELECT COUNT(*) as c FROM direct_sales WHERE status = 'completed'");
  const todaySales = get("SELECT COUNT(*) as c, COALESCE(SUM(total), 0) as t FROM direct_sales WHERE status = 'completed' AND date(created_at) = ?", [today]);
  const monthSales = get("SELECT COUNT(*) as c, COALESCE(SUM(total), 0) as t FROM direct_sales WHERE status = 'completed' AND created_at >= date('now', 'start of month')");
  const byMethod = query(`SELECT payment_method, COUNT(*) as count, SUM(total) as total
    FROM direct_sales WHERE status = 'completed' GROUP BY payment_method ORDER BY total DESC`);

  success(res, {
    total: total?.c || 0,
    today: { count: todaySales?.c || 0, total: todaySales?.t || 0 },
    month: { count: monthSales?.c || 0, total: monthSales?.t || 0 },
    by_payment_method: byMethod
  });
};
