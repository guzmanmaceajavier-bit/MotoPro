const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const sessionId = req.headers["x-session-id"];
  const customerId = req.user?.id;
  if (customerId) {
    const items = query("SELECT * FROM cart_items WHERE customer_id = ?", [customerId]);
    return success(res, items);
  }
  if (!sessionId) return success(res, []);
  const items = query("SELECT * FROM cart_items WHERE session_id = ?", [sessionId]);
  success(res, items);
};

exports.add = (req, res) => {
  const { product_id, name, price, image, quantity } = req.body;
  const sessionId = req.headers["x-session-id"] || generateId();
  const customerId = req.user?.id || null;
  if (!product_id || !name || !price) return error(res, "Datos del producto requeridos", 400);
  const lookup = customerId ? "customer_id = ?" : "session_id = ?";
  const lookupVal = customerId || sessionId;
  const existing = get(`SELECT * FROM cart_items WHERE ${lookup} AND product_id = ?`, [lookupVal, product_id]);
  if (existing) {
    run("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?", [quantity || 1, existing.id]);
  } else {
    run("INSERT INTO cart_items (id, session_id, customer_id, product_id, name, price, image, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [generateId(), sessionId, customerId, product_id, name, price, image || null, quantity || 1]);
  }
  const items = customerId
    ? query("SELECT * FROM cart_items WHERE customer_id = ?", [customerId])
    : query("SELECT * FROM cart_items WHERE session_id = ?", [sessionId]);
  success(res, { items, session_id: sessionId }, "Producto agregado");
};

exports.update = (req, res) => {
  const { quantity } = req.body;
  const existing = get("SELECT id FROM cart_items WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Item no encontrado", 404);
  if (quantity <= 0) {
    run("DELETE FROM cart_items WHERE id = ?", [req.params.id]);
  } else {
    run("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, req.params.id]);
  }
  success(res, null, "Carrito actualizado");
};

exports.remove = (req, res) => {
  run("DELETE FROM cart_items WHERE id = ?", [req.params.id]);
  success(res, null, "Item eliminado");
};
