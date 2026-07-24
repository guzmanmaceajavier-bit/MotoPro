const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { search, brand, customer_id, page, limit } = req.query;
  let sql = `SELECT v.*, c.name as customer_name, c.phone as customer_phone,
    (SELECT COUNT(*) FROM work_orders wo WHERE wo.vehicle_id = v.id) as service_count,
    (SELECT MAX(vsh.mileage_at_service) FROM vehicle_service_history vsh WHERE vsh.vehicle_id = v.id) as last_mileage
    FROM vehicles v LEFT JOIN customers c ON c.id = v.customer_id`;
  const params = [];
  const conditions = [];
  if (search) {
    conditions.push("(v.plate LIKE ? OR v.brand LIKE ? OR v.model LIKE ? OR c.name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (brand) { conditions.push("v.brand = ?"); params.push(brand); }
  if (customer_id) { conditions.push("v.customer_id = ?"); params.push(customer_id); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY v.created_at DESC";
  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = query(`SELECT COUNT(*) as total FROM vehicles v LEFT JOIN customers c ON c.id = v.customer_id${conditions.length ? " WHERE " + conditions.join(" AND ") : ""}`, params);
    const total = countRow[0]?.total || 0;
    const data = query(`${sql} LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }
  const data = query(sql, params);
  success(res, data);
};

exports.getById = (req, res) => {
  const vehicle = get(
    `SELECT v.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
     FROM vehicles v LEFT JOIN customers c ON c.id = v.customer_id WHERE v.id = ?`,
    [req.params.id]
  );
  if (!vehicle) return error(res, "Vehiculo no encontrado", 404);

  // Service history
  vehicle.service_history = query(
    `SELECT vsh.*, wo.order_number, wo.status as wo_status, wo.total as wo_total
     FROM vehicle_service_history vsh
     LEFT JOIN work_orders wo ON vsh.work_order_id = wo.id
     WHERE vsh.vehicle_id = ? ORDER BY vsh.created_at DESC`,
    [req.params.id]
  );

  // Work orders
  vehicle.work_orders = query(
    `SELECT wo.*, tm.name as mechanic_name FROM work_orders wo
     LEFT JOIN team_members tm ON wo.assigned_to = tm.id
     WHERE wo.vehicle_id = ? ORDER BY wo.created_at DESC`,
    [req.params.id]
  );

  // Photos
  vehicle.photos = query("SELECT * FROM vehicle_photos WHERE vehicle_id = ? ORDER BY created_at DESC", [req.params.id]);

  // Documents
  vehicle.documents = query("SELECT * FROM vehicle_documents WHERE vehicle_id = ? ORDER BY created_at DESC", [req.params.id]);

  // Mileage history
  vehicle.mileage_history = query("SELECT * FROM vehicle_mileage WHERE vehicle_id = ? ORDER BY recorded_at DESC", [req.params.id]);

  // Latest mileage
  const latestMileage = get("SELECT mileage FROM vehicle_mileage WHERE vehicle_id = ? ORDER BY recorded_at DESC LIMIT 1", [req.params.id]);
  vehicle.current_mileage = latestMileage?.mileage || vehicle.mileage || 0;

  success(res, vehicle);
};

exports.create = (req, res) => {
  const { customer_id, brand, model, year, plate, vin, color, mileage, observations } = req.body;
  if (!customer_id || !brand || !model || !plate) return error(res, "Cliente, marca, modelo y placa requeridos", 400);
  const existing = get("SELECT id FROM vehicles WHERE plate = ?", [plate]);
  if (existing) return error(res, "Ya existe un vehiculo con esa placa", 400);
  const id = generateId();
  run("INSERT INTO vehicles (id, customer_id, brand, model, year, plate, vin, color, mileage, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, customer_id, brand, model, year || "", plate, vin || "", color || "", mileage || 0, observations || ""]);
  // Record initial mileage
  if (mileage > 0) {
    run("INSERT INTO vehicle_mileage (id, vehicle_id, mileage, source, notes) VALUES (?, ?, ?, 'registration', 'Kilometraje inicial')",
      [generateId(), id, mileage]);
  }
  success(res, { id }, "Vehiculo creado", 201);
};

exports.update = (req, res) => {
  const { customer_id, brand, model, year, plate, vin, color, mileage, observations } = req.body;
  const existing = get("SELECT id FROM vehicles WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Vehiculo no encontrado", 404);
  if (plate) {
    const dup = get("SELECT id FROM vehicles WHERE plate = ? AND id != ?", [plate, req.params.id]);
    if (dup) return error(res, "Ya existe otro vehiculo con esa placa", 400);
  }
  run(`UPDATE vehicles SET
    customer_id = COALESCE(?, customer_id), brand = COALESCE(?, brand),
    model = COALESCE(?, model), year = COALESCE(?, year),
    plate = COALESCE(?, plate), vin = COALESCE(?, vin),
    color = COALESCE(?, color), mileage = COALESCE(?, mileage),
    observations = COALESCE(?, observations),
    updated_at = datetime('now') WHERE id = ?`,
    [customer_id || null, brand || null, model || null, year || null,
     plate || null, vin || null, color || null, mileage != null ? mileage : null,
     observations || null, req.params.id]);
  success(res, null, "Vehiculo actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM vehicles WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Vehiculo no encontrado", 404);
  run("DELETE FROM vehicles WHERE id = ?", [req.params.id]);
  success(res, null, "Vehiculo eliminado");
};

// ── Photos ──
exports.addPhoto = (req, res) => {
  const { url, caption, category } = req.body;
  if (!url) return error(res, "URL requerida", 400);
  const id = generateId();
  run("INSERT INTO vehicle_photos (id, vehicle_id, url, caption, category) VALUES (?, ?, ?, ?, ?)",
    [id, req.params.id, url, caption || "", category || "general"]);
  success(res, { id }, "Foto agregada", 201);
};

exports.removePhoto = (req, res) => {
  run("DELETE FROM vehicle_photos WHERE id = ? AND vehicle_id = ?", [req.params.photoId, req.params.id]);
  success(res, null, "Foto eliminada");
};

// ── Documents ──
exports.addDocument = (req, res) => {
  const { name, type, url, notes, expiry_date } = req.body;
  if (!name) return error(res, "Nombre requerido", 400);
  const id = generateId();
  run("INSERT INTO vehicle_documents (id, vehicle_id, name, type, url, notes, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, req.params.id, name, type || "other", url || "", notes || "", expiry_date || null]);
  success(res, { id }, "Documento agregado", 201);
};

exports.removeDocument = (req, res) => {
  run("DELETE FROM vehicle_documents WHERE id = ? AND vehicle_id = ?", [req.params.docId, req.params.id]);
  success(res, null, "Documento eliminado");
};

// ── Mileage ──
exports.addMileage = (req, res) => {
  const { mileage, source, notes } = req.body;
  if (!mileage && mileage !== 0) return error(res, "Kilometraje requerido", 400);
  const id = generateId();
  run("INSERT INTO vehicle_mileage (id, vehicle_id, mileage, source, notes) VALUES (?, ?, ?, ?, ?)",
    [id, req.params.id, mileage, source || "manual", notes || ""]);
  // Update vehicle mileage
  run("UPDATE vehicles SET mileage = ?, updated_at = datetime('now') WHERE id = ?", [mileage, req.params.id]);
  success(res, { id }, "Kilometraje registrado", 201);
};

exports.mileageHistory = (req, res) => {
  const history = query("SELECT * FROM vehicle_mileage WHERE vehicle_id = ? ORDER BY recorded_at DESC", [req.params.id]);
  success(res, history);
};

// ── Compatibility check ──
exports.checkCompatibility = (req, res) => {
  const { plate } = req.query;
  if (!plate) return error(res, "Placa requerida", 400);
  const vehicle = get("SELECT v.*, c.name as customer_name FROM vehicles v LEFT JOIN customers c ON c.id = v.customer_id WHERE v.plate = ?", [plate]);
  if (!vehicle) return success(res, { compatible: false, message: "Vehiculo no registrado" });
  const workOrders = query("SELECT COUNT(*) as c FROM work_orders WHERE vehicle_id = ?", [vehicle.id]);
  success(res, {
    compatible: true,
    vehicle: {
      id: vehicle.id, brand: vehicle.brand, model: vehicle.model, year: vehicle.year,
      plate: vehicle.plate, color: vehicle.color, customer_name: vehicle.customer_name,
    },
    serviceCount: workOrders[0]?.c || 0,
  });
};
