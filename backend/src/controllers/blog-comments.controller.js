const { query, get, run } = require("../config/database");
const { generateId, success, error, paginate } = require("../utils/helpers");

exports.list = (req, res) => {
  const { post_id, is_approved, page = 1, limit = 20 } = req.query;
  let sql = "SELECT * FROM blog_comments";
  const params = [];
  const conds = [];
  if (post_id) conds.push("post_id = ?");
  if (is_approved !== undefined && is_approved !== "") conds.push("is_approved = ?");
  if (conds.length) sql += " WHERE " + conds.join(" AND ");
  if (post_id) params.push(post_id);
  if (is_approved !== undefined && is_approved !== "") params.push(Number(is_approved));
  sql += " ORDER BY created_at DESC";
  const all = query(sql, params);
  const result = paginate(all, Number(page), Number(limit));
  res.json({ success: true, message: "OK", data: result.data, pagination: result.pagination });
};

exports.getById = (req, res) => {
  const comment = get("SELECT * FROM blog_comments WHERE id = ?", [req.params.id]);
  if (!comment) return error(res, "Comentario no encontrado", 404);
  success(res, comment);
};

exports.create = (req, res) => {
  const { post_id, author_name, author_email, content } = req.body;
  if (!post_id || !author_name || !content) return error(res, "post_id, author_name y content son requeridos", 400);
  const id = generateId();
  run("INSERT INTO blog_comments (id, post_id, author_name, author_email, content) VALUES (?, ?, ?, ?, ?)",
    [id, post_id, author_name, author_email || "", content]);
  const created = get("SELECT * FROM blog_comments WHERE id = ?", [id]);
  success(res, created, "Comentario creado", 201);
};

exports.update = (req, res) => {
  const existing = get("SELECT id FROM blog_comments WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Comentario no encontrado", 404);
  const { author_name, author_email, content } = req.body;
  run("UPDATE blog_comments SET author_name = ?, author_email = ?, content = ? WHERE id = ?",
    [author_name || "", author_email || "", content || "", req.params.id]);
  success(res, null, "Comentario actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM blog_comments WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Comentario no encontrado", 404);
  run("DELETE FROM blog_comments WHERE id = ?", [req.params.id]);
  success(res, null, "Comentario eliminado");
};

exports.approve = (req, res) => {
  const existing = get("SELECT id FROM blog_comments WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Comentario no encontrado", 404);
  run("UPDATE blog_comments SET is_approved = 1 WHERE id = ?", [req.params.id]);
  success(res, null, "Comentario aprobado");
};
