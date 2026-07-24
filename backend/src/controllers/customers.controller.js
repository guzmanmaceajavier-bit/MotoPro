const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { search, sort, registered, customer_type } = req.query;
  let sql = "SELECT id, name, email, phone, address, avatar, total_orders, total_spent, customer_type, notes, default_vehicle_id, total_services, last_service_date, CASE WHEN password IS NOT NULL AND password != '' THEN 1 ELSE 0 END as is_registered, created_at, updated_at FROM customers";
  const params = [];
  const conditions = [];
  if (search) { conditions.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)"); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (registered === "1") conditions.push("(password IS NOT NULL AND password != '')");
  if (registered === "0") conditions.push("(password IS NULL OR password = '')");
  if (customer_type) { conditions.push("customer_type = ?"); params.push(customer_type); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += sort === "spent" ? " ORDER BY total_spent DESC" : sort === "name" ? " ORDER BY name ASC" : " ORDER BY created_at DESC";
  success(res, query(sql, params));
};

exports.getById = (req, res) => {
  const customer = get("SELECT * FROM customers WHERE id = ?", [req.params.id]);
  if (!customer) return error(res, "Cliente no encontrado", 404);

  // Vehicles
  customer.vehicles = query("SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC", [customer.id]);

  // Store orders
  customer.orders = query("SELECT * FROM store_orders WHERE customer_email = ? ORDER BY created_at DESC LIMIT 20", [customer.email]);

  // Work orders (service history)
  customer.workOrders = query(
    `SELECT wo.id, wo.order_number, wo.status, wo.service_type, wo.vehicle_description, wo.total, wo.created_at, wo.updated_at
     FROM work_orders wo
     LEFT JOIN vehicles v ON wo.vehicle_id = v.id
     WHERE wo.customer_id = ? OR wo.customer_email = ?
     ORDER BY wo.created_at DESC LIMIT 20`,
    [customer.id, customer.email]
  );

  // Service history from vehicle_service_history
  customer.serviceHistory = query(
    `SELECT vsh.*, v.brand, v.model, v.plate
     FROM vehicle_service_history vsh
     LEFT JOIN vehicles v ON vsh.vehicle_id = v.id
     WHERE v.id IN (SELECT id FROM vehicles WHERE customer_id = ?)
     ORDER BY vsh.created_at DESC LIMIT 20`,
    [customer.id]
  );

  // Addresses
  customer.addresses = query("SELECT * FROM customer_addresses WHERE customer_id = ?", [customer.id]);

  // Appointments
  customer.appointments = query(
    `SELECT a.*, tm.name as mechanic_name FROM appointments a
     LEFT JOIN team_members tm ON a.mechanic_id = tm.id
     WHERE a.customer_id = ? OR a.customer_email = ?
     ORDER BY a.appointment_date DESC LIMIT 10`,
    [customer.id, customer.email]
  );

  success(res, customer);
};

exports.create = (req, res) => {
  const { name, email, phone, address, customer_type, notes, avatar, nit } = req.body;
  if (!name || !email) return error(res, "Nombre y email requeridos", 400);
  const existing = get("SELECT id FROM customers WHERE email = ?", [email]);
  if (existing) return error(res, "Ya existe un cliente con ese email", 400);
  const id = generateId();
  run("INSERT INTO customers (id, name, email, phone, address, customer_type, notes, avatar, nit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, name, email, phone || "", address || "", customer_type || "", notes || "", avatar || "", nit || ""]);
  success(res, { id }, "Cliente creado", 201);
};

exports.update = (req, res) => {
  const { name, phone, address, avatar, customer_type, notes, nit, default_vehicle_id } = req.body;
  const existing = get("SELECT id FROM customers WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Cliente no encontrado", 404);
  run(`UPDATE customers SET
    name = COALESCE(?, name), phone = COALESCE(?, phone),
    address = COALESCE(?, address), avatar = COALESCE(?, avatar),
    customer_type = COALESCE(?, customer_type), notes = COALESCE(?, notes),
    nit = COALESCE(?, nit), default_vehicle_id = ?,
    updated_at = datetime('now') WHERE id = ?`,
    [name || null, phone || null, address || null, avatar || null, customer_type || null, notes || null, nit || null, default_vehicle_id || null, req.params.id]);
  success(res, null, "Cliente actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM customers WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Cliente no encontrado", 404);
  run("DELETE FROM customers WHERE id = ?", [req.params.id]);
  success(res, null, "Cliente eliminado");
};

exports.vehicles = (req, res) => {
  const vehicles = query(
    `SELECT v.*, c.name as customer_name,
      (SELECT COUNT(*) FROM work_orders wo WHERE wo.vehicle_id = v.id) as service_count,
      (SELECT MAX(vsh.mileage_at_service) FROM vehicle_service_history vsh WHERE vsh.vehicle_id = v.id) as last_mileage
     FROM vehicles v LEFT JOIN customers c ON c.id = v.customer_id
     WHERE v.customer_id = ? ORDER BY v.created_at DESC`,
    [req.params.id]
  );
  success(res, vehicles);
};

exports.notes = (req, res) => {
  const customer = get("SELECT notes FROM customers WHERE id = ?", [req.params.id]);
  if (!customer) return error(res, "Cliente no encontrado", 404);
  success(res, { notes: customer.notes || "" });
};

exports.updateNotes = (req, res) => {
  const { notes } = req.body;
  const existing = get("SELECT id FROM customers WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Cliente no encontrado", 404);
  run("UPDATE customers SET notes = ?, updated_at = datetime('now') WHERE id = ?", [notes || "", req.params.id]);
  success(res, null, "Notas actualizadas");
};

exports.history = (req, res) => {
  const customer = get("SELECT email FROM customers WHERE id = ?", [req.params.id]);
  if (!customer) return error(res, "Cliente no encontrado", 404);

  const workOrders = query(
    `SELECT wo.*, tm.name as mechanic_name FROM work_orders wo
     LEFT JOIN team_members tm ON wo.assigned_to = tm.id
     WHERE wo.customer_id = ? OR wo.customer_email = ?
     ORDER BY wo.created_at DESC`,
    [req.params.id, customer.email]
  );

  const storeOrders = query(
    "SELECT * FROM store_orders WHERE customer_email = ? ORDER BY created_at DESC",
    [customer.email]
  );

  const appointments = query(
    `SELECT a.*, tm.name as mechanic_name FROM appointments a
     LEFT JOIN team_members tm ON a.mechanic_id = tm.id
     WHERE a.customer_id = ? OR a.customer_email = ?
     ORDER BY a.appointment_date DESC`,
    [req.params.id, customer.email]
  );

  success(res, { workOrders, storeOrders, appointments });
};
