const router = require("express").Router();
const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

router.get("/points/:customerId", (req, res) => {
  try {
    const points = get("SELECT * FROM loyalty_points WHERE customer_id = ?", [req.params.customerId]);
    const history = query("SELECT * FROM loyalty_history WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50", [req.params.customerId]);
    success(res, { points: points?.balance || 0, total_earned: points?.total_earned || 0, total_redeemed: points?.total_redeemed || 0, history });
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.post("/points/:customerId", (req, res) => {
  try {
    const { points, description } = req.body;
    if (!points || typeof points !== "number") return error(res, "Puntos inválidos", 400);
    if (points > 0) {
      awardPoints(req.params.customerId, points, "adjust", description || "Ajuste manual");
    } else {
      redeemPoints(req.params.customerId, Math.abs(points), description || "Ajuste manual");
    }
    const updated = get("SELECT * FROM loyalty_points WHERE customer_id = ?", [req.params.customerId]);
    success(res, { balance: updated?.balance || 0 }, `${points > 0 ? "Puntos agregados" : "Puntos restados"}`);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/", (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const total = get("SELECT COUNT(*) as c FROM loyalty_points WHERE balance > 0");
    const customers = query(`SELECT lp.*, c.name, c.email, c.phone
      FROM loyalty_points lp JOIN customers c ON lp.customer_id = c.id
      WHERE lp.balance > 0 ORDER BY lp.balance DESC LIMIT ? OFFSET ?`, [parseInt(limit), parseInt(offset)]);
    success(res, { customers, total: total?.c || 0, page: parseInt(page), pages: Math.ceil((total?.c || 0) / limit) });
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/customers", (req, res) => {
  try {
    const rows = query(`SELECT lp.id, lp.customer_id, c.name, c.email, c.phone,
      lp.balance as points, lp.total_earned as totalEarned, lp.total_redeemed as totalRedeemed, lp.created_at
      FROM loyalty_points lp JOIN customers c ON lp.customer_id = c.id
      ORDER BY lp.balance DESC`);
    success(res, rows);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/history", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const rows = query(`SELECT lh.*, c.name as customer_name
      FROM loyalty_history lh JOIN customers c ON lh.customer_id = c.id
      ORDER BY lh.created_at DESC LIMIT ?`, [limit]);
    success(res, rows);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.get("/config", (req, res) => {
  try {
    const config = {};
    const keys = ["loyalty_enabled", "loyalty_points_per_100k", "loyalty_points_per_service", "loyalty_birthday_bonus", "loyalty_first_order_bonus", "loyalty_redemption_rate"];
    keys.forEach(k => { const r = get("SELECT value FROM site_config WHERE key = ?", [k]); config[k] = r?.value || ""; });
    success(res, config);
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

router.put("/config", (req, res) => {
  try {
    const { run: r } = require("../config/database");
    for (const [key, value] of Object.entries(req.body)) {
      const existing = get("SELECT key FROM site_config WHERE key = ?", [key]);
      if (existing) r("UPDATE site_config SET value = ? WHERE key = ?", [String(value), key]);
      else r("INSERT INTO site_config (key, value) VALUES (?, ?)", [key, String(value)]);
    }
    success(res, null, "Configuración actualizada");
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

function awardPoints(customerId, points, type, description, entityId) {
  try {
    const config = {};
    ["loyalty_enabled", "loyalty_points_per_100k", "loyalty_points_per_service"].forEach(k => {
      const r = get("SELECT value FROM site_config WHERE key = ?", [k]);
      config[k] = r?.value;
    });
    if (config.loyalty_enabled !== "true") return;

    let existing = get("SELECT * FROM loyalty_points WHERE customer_id = ?", [customerId]);
    if (!existing) {
      const id = generateId();
      run("INSERT INTO loyalty_points (id, customer_id, balance, total_earned, total_redeemed) VALUES (?, ?, 0, 0, 0)", [id, customerId]);
      existing = get("SELECT * FROM loyalty_points WHERE customer_id = ?", [customerId]);
    }

    run("UPDATE loyalty_points SET balance = balance + ?, total_earned = total_earned + ? WHERE customer_id = ?",
      [points, points, customerId]);

    const hid = generateId();
    run("INSERT INTO loyalty_history (id, customer_id, points, type, description, entity_id) VALUES (?, ?, ?, ?, ?, ?)",
      [hid, customerId, points, type, description, entityId || ""]);
  } catch (err) {
    console.error("Loyalty award error:", err.message);
  }
}

function redeemPoints(customerId, points, description, entityId) {
  try {
    const existing = get("SELECT * FROM loyalty_points WHERE customer_id = ?", [customerId]);
    if (!existing || existing.balance < points) return false;

    run("UPDATE loyalty_points SET balance = balance - ?, total_redeemed = total_redeemed + ? WHERE customer_id = ?",
      [points, points, customerId]);

    const hid = generateId();
    run("INSERT INTO loyalty_history (id, customer_id, points, type, description, entity_id) VALUES (?, ?, ?, 'redeemed', ?, ?)",
      [hid, customerId, -points, description, entityId || ""]);
    return true;
  } catch (err) {
    console.error("Loyalty redeem error:", err.message);
    return false;
  }
}

router.get("/balance/:customerId", (req, res) => {
  try {
    const points = get("SELECT balance FROM loyalty_points WHERE customer_id = ?", [req.params.customerId]);
    const config = get("SELECT value FROM site_config WHERE key = 'loyalty_redemption_rate'");
    const rate = parseInt(config?.value || "1000");
    success(res, {
      points: points?.balance || 0,
      redemption_rate: rate,
      max_discount: Math.floor((points?.balance || 0) / rate) * rate,
    });
  } catch (err) { console.error(err); error(res, "Error", 500); }
});

module.exports = router;
module.exports.awardPoints = awardPoints;
module.exports.redeemPoints = redeemPoints;
