const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.getByWorkOrder = (req, res) => {
  const diagnostic = get("SELECT * FROM diagnostics WHERE work_order_id = ?", [req.params.workOrderId]);
  if (!diagnostic) return error(res, "Diagnóstico no encontrado", 404);
  success(res, diagnostic);
};

exports.create = (req, res) => {
  const { work_order_id, mechanic_id, findings, recommendations, urgency, estimated_cost, estimated_days } = req.body;
  if (!work_order_id) return error(res, "work_order_id requerido", 400);

  const existing = get("SELECT id FROM diagnostics WHERE work_order_id = ?", [work_order_id]);
  if (existing) return error(res, "Ya existe un diagnóstico para esta orden", 400);

  const id = generateId();
  run(`INSERT INTO diagnostics (id, work_order_id, mechanic_id, findings, recommendations, urgency, estimated_cost, estimated_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, work_order_id, mechanic_id || null, findings || "", recommendations || "", urgency || "normal", estimated_cost || 0, estimated_days || 0]);

  run("UPDATE work_orders SET status = 'diagnosed', updated_at = datetime('now') WHERE id = ?", [work_order_id]);
  run("INSERT INTO work_order_timeline (id, work_order_id, status, description, created_by) VALUES (?, ?, 'diagnosed', 'Diagnóstico completado', ?)",
    [generateId(), work_order_id, req.user?.id || "system"]);

  success(res, { id }, "Diagnóstico creado", 201);
};

exports.update = (req, res) => {
  const { findings, recommendations, urgency, estimated_cost, estimated_days } = req.body;
  const existing = get("SELECT id FROM diagnostics WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Diagnóstico no encontrado", 404);

  run(`UPDATE diagnostics SET
    findings = COALESCE(?, findings),
    recommendations = COALESCE(?, recommendations),
    urgency = COALESCE(?, urgency),
    estimated_cost = COALESCE(?, estimated_cost),
    estimated_days = COALESCE(?, estimated_days),
    updated_at = datetime('now')
    WHERE id = ?`,
    [findings || null, recommendations || null, urgency || null, estimated_cost || null, estimated_days || null, req.params.id]);

  success(res, null, "Diagnóstico actualizado");
};
