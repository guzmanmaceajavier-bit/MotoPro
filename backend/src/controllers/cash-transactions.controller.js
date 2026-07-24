const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { type, category, cash_register_id, page, limit } = req.query;
  let where = "";
  const params = [];
  const conditions = [];
  if (type) { conditions.push("type = ?"); params.push(type); }
  if (category) { conditions.push("category = ?"); params.push(category); }
  if (cash_register_id) { conditions.push("cash_register_id = ?"); params.push(cash_register_id); }
  if (conditions.length) where = " WHERE " + conditions.join(" AND ");

  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = query(`SELECT COUNT(*) as total FROM cash_transactions${where}`, params);
    const total = countRow[0]?.total || 0;
    const data = query(`SELECT * FROM cash_transactions${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }

  const data = query(`SELECT * FROM cash_transactions${where} ORDER BY created_at DESC LIMIT 100`, params);
  success(res, data);
};

exports.create = (req, res) => {
  const { cash_register_id, type, category, amount, description, reference_type, reference_id, payment_method } = req.body;
  if (!cash_register_id || !type || !category || amount === undefined) return error(res, "cash_register_id, type, category y amount requeridos", 400);

  const register = get("SELECT id, status FROM cash_register WHERE id = ?", [cash_register_id]);
  if (!register) return error(res, "Caja no encontrada", 404);
  if (register.status !== "open") return error(res, "La caja está cerrada", 400);

  const id = generateId();
  run("INSERT INTO cash_transactions (id, cash_register_id, type, category, amount, description, reference_type, reference_id, payment_method, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, cash_register_id, type, category, amount, description || "", reference_type || null, reference_id || null, payment_method || "cash", req.user?.id || "system"]);

  success(res, { id }, "Movimiento registrado", 201);
};

exports.summary = (req, res) => {
  const register = get("SELECT id FROM cash_register WHERE status = 'open' ORDER BY opened_at DESC LIMIT 1");
  if (!register) return success(res, { income: 0, expenses: 0, balance: 0, count: 0 });

  const result = get(`SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses,
    COUNT(*) as count
    FROM cash_transactions WHERE cash_register_id = ?`, [register.id]);

  const registerData = get("SELECT opening_amount FROM cash_register WHERE id = ?", [register.id]);
  const balance = (registerData?.opening_amount || 0) + (result?.income || 0) - (result?.expenses || 0);

  success(res, { income: result?.income || 0, expenses: result?.expenses || 0, balance, count: result?.count || 0, opening_amount: registerData?.opening_amount || 0 });
};
