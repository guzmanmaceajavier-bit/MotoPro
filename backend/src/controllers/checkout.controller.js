const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { notifyAdmin, sendMail } = require("../utils/notifications");

exports.create = (req, res) => {
  const { customer_name, customer_email, customer_phone, items, total, payment_method, shipping_address, shipping_cost, motorcycle, notes, nit } = req.body;
  if (!customer_name || !customer_email || !items || !total) return error(res, "Datos de orden requeridos", 400);

  // Validate stock before creating order
  const orderItems = Array.isArray(items) ? items : (typeof items === "string" ? JSON.parse(items) : []);
  const outOfStock = [];
  for (const item of orderItems) {
    const prod = get("SELECT id, name, stock FROM products WHERE id = ?", [item.id || item.product_id]);
    if (!prod) continue;
    const qty = item.quantity || 1;
    if (prod.stock < qty) outOfStock.push({ name: prod.name, stock: prod.stock, requested: qty });
  }
  if (outOfStock.length) return error(res, { code: "INSUFFICIENT_STOCK", items: outOfStock }, 400);

  const sessionId = req.headers["x-session-id"] || generateId();
  const customerId = req.user?.id || null;
  const id = generateId();
  run("INSERT INTO store_orders (id, session_id, customer_id, customer_name, customer_email, customer_phone, items, total, payment_method, shipping_address, shipping_cost, motorcycle, notes, nit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, sessionId, customerId, customer_name, customer_email, customer_phone || "", JSON.stringify(items), total, payment_method || "pending", shipping_address || "", shipping_cost || 0, motorcycle || "", notes || "", nit || ""]);

  // Deduct stock for each item
  for (const item of orderItems) {
    const prod = get("SELECT stock FROM products WHERE id = ?", [item.id || item.product_id]);
    if (prod) {
      const qty = item.quantity || 1;
      run("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?", [qty, item.id || item.product_id]);
      run("INSERT INTO inventory_movements (id, product_id, type, quantity, reference, notes) VALUES (?, ?, ?, 'out', ?, ?)",
        [generateId(), item.id || item.product_id, qty, `Orden #${id.slice(0,8)}`, `Venta - ${customer_name}`]);
    }
  }

  run("DELETE FROM cart_items WHERE session_id = ?", [sessionId]);
  sendMail({ to: customer_email, subject: "Orden recibida - Taller Motos",
    html: `<h1>Gracias por tu orden ${customer_name}</h1><p>Total: $${total.toLocaleString()}</p><p>Te contactaremos para confirmar el envío.</p>`
  });
  notifyAdmin("Nueva orden recibida",
    `<h1>Nueva orden</h1><p><b>Cliente:</b> ${customer_name}<br><b>Email:</b> ${customer_email}<br>
    <b>Total:</b> $${total.toLocaleString()}<br><b>Método de pago:</b> ${payment_method}</p>`);
  success(res, { id }, "Orden creada", 201);
};

exports.updateStatus = (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "processing", "paid", "shipped", "delivered", "cancelled"];
  if (!status || !validStatuses.includes(status)) return error(res, "Estado inválido", 400);
  const existing = get("SELECT id, customer_name, customer_email, status FROM store_orders WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Orden no encontrada", 404);
  run("UPDATE store_orders SET status = ?, updated_at = datetime('now') WHERE id = ?", [status, req.params.id]);
  if (status !== existing.status && existing.customer_email) {
    const statusLabels = { pending: "Pendiente", processing: "Procesando", paid: "Pagado", shipped: "Enviado", delivered: "Entregado", cancelled: "Cancelado" };
    sendMail({ to: existing.customer_email, subject: "Estado de tu pedido actualizado - Taller Motos",
      html: `<h2>Hola ${existing.customer_name}</h2><p>El estado de tu pedido ha sido actualizado:</p><p><b>Estado anterior:</b> ${statusLabels[existing.status] || existing.status}<br><b>Nuevo estado:</b> ${statusLabels[status] || status}</p>`
    });
  }
  success(res, null, "Estado actualizado");
};

exports.list = (req, res) => {
  const { status, search, page, limit } = req.query;
  const params = [];
  const conditions = [];
  if (status) { conditions.push("status = ?"); params.push(status); }
  if (search) { conditions.push("(customer_name LIKE ? OR customer_email LIKE ? OR id LIKE ?)"); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";

  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = query(`SELECT COUNT(*) as total FROM store_orders${where}`, params);
    const total = countRow[0]?.total || 0;
    const orders = query(`SELECT * FROM store_orders${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    const parsed = orders.map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));
    return success(res, { data: parsed, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }

  const orders = query(`SELECT * FROM store_orders${where} ORDER BY created_at DESC`, params);
  const parsed = orders.map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));
  success(res, parsed);
};

exports.getById = (req, res) => {
  const order = get("SELECT * FROM store_orders WHERE id = ?", [req.params.id]);
  if (!order) return error(res, "Orden no encontrada", 404);
  order.items = JSON.parse(order.items || '[]');
  success(res, order);
};
