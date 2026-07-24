const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  success(res, query("SELECT * FROM coupons ORDER BY created_at DESC"));
};

exports.getById = (req, res) => {
  const coupon = get("SELECT * FROM coupons WHERE id = ?", [req.params.id]);
  if (!coupon) return error(res, "Cupón no encontrado", 404);
  success(res, coupon);
};

exports.validate = (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) return error(res, "Código requerido", 400);
  const coupon = get("SELECT * FROM coupons WHERE code = ? AND is_active = 1", [code.toUpperCase()]);
  if (!coupon) return error(res, "Cupón no válido", 404);
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return error(res, "Cupón expirado", 400);
  if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) return error(res, "Cupón agotado", 400);
  if (cartTotal < coupon.min_purchase) return error(res, `Mínimo de compra: $${coupon.min_purchase}`, 400);
  run("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [coupon.id]);
  let discount = coupon.discount_type === "percentage" ? cartTotal * (coupon.discount_value / 100) : coupon.discount_value;
  if (discount > cartTotal) discount = cartTotal;
  success(res, { ...coupon, discount });
};

exports.create = (req, res) => {
  const { code, description, discount_type, discount_value, min_purchase, max_uses, expires_at } = req.body;
  if (!code || discount_value == null) return error(res, "Código y valor requeridos", 400);
  const id = generateId();
  run("INSERT INTO coupons (id, code, description, discount_type, discount_value, min_purchase, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, code.toUpperCase(), description || "", discount_type || "percentage", discount_value, min_purchase || 0, max_uses || 0, expires_at || null]);
  success(res, { id }, "Cupón creado", 201);
};

exports.update = (req, res) => {
  const { code, description, discount_type, discount_value, min_purchase, max_uses, expires_at, is_active } = req.body;
  const existing = get("SELECT id FROM coupons WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Cupón no encontrado", 404);
  run("UPDATE coupons SET code = COALESCE(?, code), description = COALESCE(?, description), discount_type = COALESCE(?, discount_type), discount_value = COALESCE(?, discount_value), min_purchase = COALESCE(?, min_purchase), max_uses = COALESCE(?, max_uses), expires_at = ?, is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
    [code ? code.toUpperCase() : null, description || null, discount_type || null, discount_value != null ? discount_value : null, min_purchase != null ? min_purchase : null, max_uses != null ? max_uses : null, expires_at || null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "Cupón actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM coupons WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Cupón no encontrado", 404);
  run("DELETE FROM coupons WHERE id = ?", [req.params.id]);
  success(res, null, "Cupón eliminado");
};