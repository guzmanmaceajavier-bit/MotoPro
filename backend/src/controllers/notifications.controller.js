const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { user_id, customer_id, type, is_read, page, limit } = req.query;
  let where = "";
  const params = [];
  const conditions = [];
  if (user_id) { conditions.push("user_id = ?"); params.push(user_id); }
  if (customer_id) { conditions.push("customer_id = ?"); params.push(customer_id); }
  if (type) { conditions.push("type = ?"); params.push(type); }
  if (is_read !== undefined) { conditions.push("is_read = ?"); params.push(is_read); }
  if (conditions.length) where = " WHERE " + conditions.join(" AND ");

  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = query(`SELECT COUNT(*) as total FROM notifications${where}`, params);
    const total = countRow[0]?.total || 0;
    const data = query(`SELECT * FROM notifications${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }

  const data = query(`SELECT * FROM notifications${where} ORDER BY created_at DESC LIMIT 50`, params);
  success(res, data);
};

exports.create = (req, res) => {
  const { user_id, customer_id, type, title, message, entity_type, entity_id } = req.body;
  if (!type || !title) return error(res, "type y title requeridos", 400);
  const id = generateId();
  run("INSERT INTO notifications (id, user_id, customer_id, type, title, message, entity_type, entity_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, user_id || null, customer_id || null, type, title, message || "", entity_type || null, entity_id || null]);
  success(res, { id }, "Notificación creada", 201);
};

exports.markRead = (req, res) => {
  const existing = get("SELECT id FROM notifications WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Notificación no encontrada", 404);
  run("UPDATE notifications SET is_read = 1 WHERE id = ?", [req.params.id]);
  success(res, null, "Notificación marcada como leída");
};

exports.markAllRead = (req, res) => {
  const { user_id, customer_id } = req.query;
  let sql = "UPDATE notifications SET is_read = 1 WHERE is_read = 0";
  const params = [];
  if (user_id) { sql += " AND user_id = ?"; params.push(user_id); }
  if (customer_id) { sql += " AND customer_id = ?"; params.push(customer_id); }
  run(sql, params);
  success(res, null, "Notificaciones marcadas como leídas");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM notifications WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Notificación no encontrada", 404);
  run("DELETE FROM notifications WHERE id = ?", [req.params.id]);
  success(res, null, "Notificación eliminada");
};
