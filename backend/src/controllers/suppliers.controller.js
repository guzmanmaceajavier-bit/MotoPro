const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { search } = req.query;
  let sql = "SELECT * FROM suppliers";
  const params = [];
  if (search) { sql += " WHERE name LIKE ? OR contact_name LIKE ? OR email LIKE ?"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += " ORDER BY name ASC";
  success(res, query(sql, params));
};

exports.getById = (req, res) => {
  const supplier = get("SELECT * FROM suppliers WHERE id = ?", [req.params.id]);
  if (!supplier) return error(res, "Proveedor no encontrado", 404);
  supplier.purchases = query("SELECT * FROM purchases WHERE supplier_id = ? ORDER BY created_at DESC LIMIT 20", [supplier.id]);
  success(res, supplier);
};

exports.create = (req, res) => {
  const { name, contact_name, email, phone, address, city, nit, notes } = req.body;
  if (!name) return error(res, "Nombre del proveedor requerido", 400);
  const id = generateId();
  run("INSERT INTO suppliers (id, name, contact_name, email, phone, address, city, nit, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, name, contact_name || "", email || "", phone || "", address || "", city || "", nit || "", notes || ""]);
  success(res, { id }, "Proveedor creado", 201);
};

exports.update = (req, res) => {
  const { name, contact_name, email, phone, address, city, nit, notes, is_active } = req.body;
  const existing = get("SELECT id FROM suppliers WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Proveedor no encontrado", 404);
  run(`UPDATE suppliers SET name = COALESCE(?, name), contact_name = COALESCE(?, contact_name), email = COALESCE(?, email),
    phone = COALESCE(?, phone), address = COALESCE(?, address), city = COALESCE(?, city), nit = COALESCE(?, nit),
    notes = COALESCE(?, notes), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?`,
    [name || null, contact_name || null, email || null, phone || null, address || null, city || null, nit || null, notes || null, is_active ?? null, req.params.id]);
  success(res, null, "Proveedor actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM suppliers WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Proveedor no encontrado", 404);
  run("DELETE FROM suppliers WHERE id = ?", [req.params.id]);
  success(res, null, "Proveedor eliminado");
};

exports.getPurchases = (req, res) => {
  const purchases = query("SELECT * FROM purchases WHERE supplier_id = ? ORDER BY created_at DESC", [req.params.id]);
  success(res, purchases);
};
