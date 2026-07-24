const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { entity_type, page, limit } = req.query;
  let where = "";
  const params = [];
  if (entity_type) { where = " WHERE al.entity_type = ?"; params.push(entity_type); }

  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 50));
    const offset = (pageNum - 1) * limitNum;
    const countRow = query(`SELECT COUNT(*) as total FROM activity_logs al${where}`, params);
    const total = countRow[0]?.total || 0;
    const data = query(`SELECT al.*, u.name as user_name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id${where} ORDER BY al.created_at DESC LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }

  const data = query(`SELECT al.*, u.name as user_name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id${where} ORDER BY al.created_at DESC`, params);
  success(res, data);
};

exports.create = (req, res) => {
  const { action, entity_type, entity_id, description } = req.body;
  if (!action) return error(res, "Acción requerida", 400);
  const id = generateId();
  const userId = req.user?.id || null;
  const ip = req.ip || req.connection?.remoteAddress || "";
  run("INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, userId, action, entity_type || "", entity_id || "", description || "", ip]);
  return { id };
};

exports.clear = (req, res) => {
  run("DELETE FROM activity_logs");
  success(res, null, "Logs eliminados");
};