const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.getCurrent = (req, res) => {
  const register = get("SELECT * FROM cash_register WHERE status = 'open' ORDER BY opened_at DESC LIMIT 1");
  if (!register) return success(res, null);

  register.transactions = query("SELECT * FROM cash_transactions WHERE cash_register_id = ? ORDER BY created_at DESC", [register.id]);

  const totals = get(`SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
    COUNT(*) as transaction_count
    FROM cash_transactions WHERE cash_register_id = ?`, [register.id]);
  register.summary = {
    total_income: totals?.total_income || 0,
    total_expenses: totals?.total_expenses || 0,
    balance: register.opening_amount + (totals?.total_income || 0) - (totals?.total_expenses || 0),
    transaction_count: totals?.transaction_count || 0
  };

  // Get breakdown by payment method
  const byMethod = query(`SELECT payment_method, type, SUM(amount) as total, COUNT(*) as count
    FROM cash_transactions WHERE cash_register_id = ?
    GROUP BY payment_method, type ORDER BY total DESC`, [register.id]);
  register.by_payment_method = byMethod;

  // Get breakdown by category
  const byCategory = query(`SELECT category, type, SUM(amount) as total, COUNT(*) as count
    FROM cash_transactions WHERE cash_register_id = ?
    GROUP BY category, type ORDER BY total DESC`, [register.id]);
  register.by_category = byCategory;

  success(res, register);
};

exports.open = (req, res) => {
  const openRegister = get("SELECT id FROM cash_register WHERE status = 'open'");
  if (openRegister) return error(res, "Ya hay una caja abierta", 400);

  const { opening_amount, notes, denomination_counts } = req.body;
  if (opening_amount === undefined || opening_amount < 0) return error(res, "Monto de apertura requerido (>= 0)", 400);

  const id = generateId();
  run("INSERT INTO cash_register (id, opening_amount, status, opened_by, notes, denomination_counts) VALUES (?, ?, 'open', ?, ?, ?)",
    [id, parseFloat(opening_amount), req.user?.name || "system", notes || "", JSON.stringify(denomination_counts || {})]);
  success(res, { id }, "Caja abierta", 201);
};

exports.close = (req, res) => {
  const register = get("SELECT * FROM cash_register WHERE id = ?", [req.params.id]);
  if (!register) return error(res, "Caja no encontrada", 404);
  if (register.status !== "open") return error(res, "La caja ya está cerrada", 400);

  const { actual_balance, notes, denomination_counts } = req.body;
  if (actual_balance === undefined || actual_balance < 0) return error(res, "Monto físico requerido (>= 0)", 400);

  const totals = get(`SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
    FROM cash_transactions WHERE cash_register_id = ?`, [register.id]);
  const expected = register.opening_amount + (totals?.total_income || 0) - (totals?.total_expenses || 0);
  const difference = parseFloat(actual_balance) - expected;

  run(`UPDATE cash_register SET closing_amount = ?, total_income = ?, total_expenses = ?,
    expected_balance = ?, actual_balance = ?, difference = ?, status = 'closed',
    closed_by = ?, closed_at = datetime('now'), notes = COALESCE(?, notes),
    denomination_counts = COALESCE(?, denomination_counts) WHERE id = ?`,
    [parseFloat(actual_balance), totals?.total_income || 0, totals?.total_expenses || 0,
     expected, parseFloat(actual_balance), difference,
     req.user?.name || "system", notes || null,
     JSON.stringify(denomination_counts || {}), req.params.id]);

  success(res, {
    opening_amount: register.opening_amount,
    total_income: totals?.total_income || 0,
    total_expenses: totals?.total_expenses || 0,
    expected, actual: parseFloat(actual_balance), difference
  }, "Caja cerrada");
};

exports.arqueo = (req, res) => {
  const register = get("SELECT * FROM cash_register WHERE status = 'open' ORDER BY opened_at DESC LIMIT 1");
  if (!register) return error(res, "No hay caja abierta", 404);

  const totals = get(`SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
    FROM cash_transactions WHERE cash_register_id = ?`, [register.id]);
  const expected = register.opening_amount + (totals?.total_income || 0) - (totals?.total_expenses || 0);

  // Get bills/coins breakdown
  const { denomination_counts } = req.body;
  let counted_total = 0;
  if (denomination_counts && typeof denomination_counts === "object") {
    Object.values(denomination_counts).forEach(v => { counted_total += parseFloat(v) || 0; });
  }

  success(res, {
    register_id: register.id,
    opened_at: register.opened_at,
    opening_amount: register.opening_amount,
    total_income: totals?.total_income || 0,
    total_expenses: totals?.total_expenses || 0,
    expected_balance: expected,
    denomination_counts: JSON.parse(register.denomination_counts || "{}"),
    counted_total,
    difference: counted_total > 0 ? counted_total - expected : null
  });
};

exports.history = (req, res) => {
  const { page, limit, date_from, date_to } = req.query;
  let where = "WHERE status = 'closed'";
  const params = [];
  if (date_from) { where += " AND closed_at >= ?"; params.push(date_from); }
  if (date_to) { where += " AND closed_at <= ?"; params.push(date_to + " 23:59:59"); }

  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = get(`SELECT COUNT(*) as total FROM cash_register ${where}`, params);
    const total = countRow[0]?.total || 0;
    const data = query(`SELECT * FROM cash_register ${where} ORDER BY closed_at DESC LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }
  const data = query(`SELECT * FROM cash_register ${where} ORDER BY closed_at DESC LIMIT 50`, params);
  success(res, data);
};

exports.getStats = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const todayIncome = get("SELECT COALESCE(SUM(amount), 0) as t FROM cash_transactions ct JOIN cash_register cr ON ct.cash_register_id = cr.id WHERE ct.type = 'income' AND date(ct.created_at) = ?", [today]);
  const todayExpenses = get("SELECT COALESCE(SUM(amount), 0) as t FROM cash_transactions ct JOIN cash_register cr ON ct.cash_register_id = cr.id WHERE ct.type = 'expense' AND date(ct.created_at) = ?", [today]);
  const monthIncome = get("SELECT COALESCE(SUM(amount), 0) as t FROM cash_transactions ct JOIN cash_register cr ON ct.cash_register_id = cr.id WHERE ct.type = 'income' AND ct.created_at >= date('now', 'start of month')");
  const monthExpenses = get("SELECT COALESCE(SUM(amount), 0) as t FROM cash_transactions ct JOIN cash_register cr ON ct.cash_register_id = cr.id WHERE ct.type = 'expense' AND ct.created_at >= date('now', 'start of month')");
  const openRegister = get("SELECT id, opening_amount, opened_at FROM cash_register WHERE status = 'open' LIMIT 1");

  success(res, {
    today: { income: todayIncome?.t || 0, expenses: todayExpenses?.t || 0, balance: (todayIncome?.t || 0) - (todayExpenses?.t || 0) },
    month: { income: monthIncome?.t || 0, expenses: monthExpenses?.t || 0, balance: (monthIncome?.t || 0) - (monthExpenses?.t || 0) },
    open_register: openRegister
  });
};
