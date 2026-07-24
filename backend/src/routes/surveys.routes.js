const router = require("express").Router();
const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

router.post("/respond", (req, res) => {
  try {
    const { survey_id, rating, comment, categories, would_recommend } = req.body;
    if (!survey_id || !rating) return error(res, "Encuesta y calificación requeridos", 400);
    if (rating < 1 || rating > 5) return error(res, "Calificación debe ser entre 1 y 5", 400);

    // Extract work_order_id from survey_id format "survey-{workOrderId}"
    const workOrderId = survey_id.replace("survey-", "");
    const order = get("SELECT id FROM work_orders WHERE id = ?", [workOrderId]);
    if (!order) return error(res, "Servicio no encontrado", 404);

    const existing = get("SELECT id FROM satisfaction_surveys WHERE survey_id = ?", [survey_id]);
    if (existing) return error(res, "Ya has respondido esta encuesta", 400);

    const id = generateId();
    run(`INSERT INTO satisfaction_surveys (id, survey_id, work_order_id, rating, comment, categories, would_recommend) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, survey_id, workOrderId, rating, comment || "", JSON.stringify(categories || []), would_recommend ? 1 : 0]);

    success(res, null, "Gracias por tu respuesta", 201);
  } catch (err) {
    console.error("Survey respond error:", err);
    error(res, "Error al guardar respuesta", 500);
  }
});

router.get("/", (req, res) => {
  try {
    const { page = 1, limit = 20, rating, search } = req.query;
    const offset = (page - 1) * limit;
    let where = "1=1";
    const params = [];

    if (rating) { where += " AND s.rating = ?"; params.push(rating); }
    if (search) { where += " AND (wo.order_number LIKE ? OR s.comment LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }

    const total = get(`SELECT COUNT(*) as c FROM satisfaction_surveys s LEFT JOIN work_orders wo ON s.work_order_id = wo.id WHERE ${where}`, params);
    const surveys = query(`SELECT s.*, wo.order_number, wo.service_type, wo.vehicle_description, wo.customer_name
      FROM satisfaction_surveys s
      LEFT JOIN work_orders wo ON s.work_order_id = wo.id
      WHERE ${where}
      ORDER BY s.created_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(limit), parseInt(offset)]);

    success(res, { surveys, total: total?.c || 0, page: parseInt(page), pages: Math.ceil((total?.c || 0) / limit) });
  } catch (err) { console.error(err); error(res, "Error al obtener encuestas", 500); }
});

router.get("/stats", (req, res) => {
  try {
    const total = get("SELECT COUNT(*) as c FROM satisfaction_surveys");
    const avg = get("SELECT AVG(rating) as avg_rating FROM satisfaction_surveys");
    const distribution = query("SELECT rating, COUNT(*) as count FROM satisfaction_surveys GROUP BY rating ORDER BY rating");
    const recommend = get("SELECT COUNT(*) as c FROM satisfaction_surveys WHERE would_recommend = 1");
    const recent = query(`SELECT s.rating, s.comment, s.created_at, wo.order_number, wo.service_type
      FROM satisfaction_surveys s LEFT JOIN work_orders wo ON s.work_order_id = wo.id
      ORDER BY s.created_at DESC LIMIT 10`);
    const byService = query(`SELECT wo.service_type, AVG(s.rating) as avg_rating, COUNT(*) as count
      FROM satisfaction_surveys s JOIN work_orders wo ON s.work_order_id = wo.id
      GROUP BY wo.service_type ORDER BY avg_rating DESC`);

    success(res, {
      total: total?.c || 0,
      avg_rating: Math.round((avg?.avg_rating || 0) * 10) / 10,
      distribution,
      recommend_pct: total?.c > 0 ? Math.round((recommend?.c / total.c) * 100) : 0,
      recent,
      by_service: byService,
    });
  } catch (err) { console.error(err); error(res, "Error al obtener estadísticas", 500); }
});

router.delete("/:id", (req, res) => {
  try {
    run("DELETE FROM satisfaction_surveys WHERE id = ?", [req.params.id]);
    success(res, null, "Encuesta eliminada");
  } catch (err) { console.error(err); error(res, "Error al eliminar", 500); }
});

module.exports = router;
