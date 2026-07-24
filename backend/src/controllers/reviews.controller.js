const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { product_id, approved } = req.query;
  let sql = "SELECT r.*, p.name as product_name FROM reviews r LEFT JOIN products p ON r.product_id = p.id";
  const params = [];
  const conds = [];
  if (product_id) conds.push("r.product_id = ?");
  if (approved === "1") conds.push("r.is_approved = 1");
  if (conds.length) sql += " WHERE " + conds.join(" AND ");
  if (product_id) params.push(product_id);
  sql += " ORDER BY r.created_at DESC";
  success(res, query(sql, params));
};

exports.getById = (req, res) => {
  const review = get("SELECT r.*, p.name as product_name FROM reviews r LEFT JOIN products p ON r.product_id = p.id WHERE r.id = ?", [req.params.id]);
  if (!review) return error(res, "Valoración no encontrada", 404);
  success(res, review);
};

exports.create = (req, res) => {
  const { product_id, customer_name, rating, title, comment } = req.body;
  if (!product_id || !customer_name || !rating) return error(res, "Producto, nombre y rating requeridos", 400);
  const id = generateId();
  run("INSERT INTO reviews (id, product_id, customer_name, rating, title, comment) VALUES (?, ?, ?, ?, ?, ?)",
    [id, product_id, customer_name, rating, title || "", comment || ""]);
  success(res, { id }, "Valoración creada", 201);
};

exports.approve = (req, res) => {
  const existing = get("SELECT id FROM reviews WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Valoración no encontrada", 404);
  run("UPDATE reviews SET is_approved = 1 WHERE id = ?", [req.params.id]);
  success(res, null, "Valoración aprobada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM reviews WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Valoración no encontrada", 404);
  run("DELETE FROM reviews WHERE id = ?", [req.params.id]);
  success(res, null, "Valoración eliminada");
};