const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { all, category } = req.query;
  let sql = "SELECT * FROM faqs";
  const params = [];
  const conds = [];
  if (all !== "1") conds.push("is_active = 1");
  if (category) conds.push("category = ?");
  if (conds.length) sql += " WHERE " + conds.join(" AND ");
  if (category) params.push(category);
  sql += " ORDER BY sort_order";
  success(res, query(sql, params));
};

exports.getById = (req, res) => {
  const faq = get("SELECT * FROM faqs WHERE id = ?", [req.params.id]);
  if (!faq) return error(res, "FAQ no encontrada", 404);
  success(res, faq);
};

exports.create = (req, res) => {
  const { question, answer, category } = req.body;
  if (!question || !answer) return error(res, "Pregunta y respuesta requeridas", 400);
  const id = generateId();
  run("INSERT INTO faqs (id, question, answer, category) VALUES (?, ?, ?, ?)",
    [id, question, answer, category || "general"]);
  success(res, { id }, "FAQ creada", 201);
};

exports.update = (req, res) => {
  const { question, answer, category, sort_order, is_active } = req.body;
  const existing = get("SELECT id FROM faqs WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "FAQ no encontrada", 404);
  run("UPDATE faqs SET question = COALESCE(?, question), answer = COALESCE(?, answer), category = COALESCE(?, category), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
    [question || null, answer || null, category || null, sort_order != null ? sort_order : null, is_active != null ? is_active : null, req.params.id]);
  success(res, null, "FAQ actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM faqs WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "FAQ no encontrada", 404);
  run("DELETE FROM faqs WHERE id = ?", [req.params.id]);
  success(res, null, "FAQ eliminada");
};