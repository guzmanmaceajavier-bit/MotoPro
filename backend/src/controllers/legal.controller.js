const { query, get, run } = require("../config/database");
const { generateId, slugify, success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const { all } = req.query;
  let sql = "SELECT id, title, slug, is_published, created_at FROM legal_pages";
  if (all !== "1") sql += " WHERE is_published = 1";
  sql += " ORDER BY created_at DESC";
  success(res, query(sql));
};

exports.getBySlug = (req, res) => {
  const page = get("SELECT * FROM legal_pages WHERE slug = ? AND is_published = 1", [req.params.slug]);
  if (!page) return error(res, "Página no encontrada", 404);
  success(res, page);
};

exports.getById = (req, res) => {
  const page = get("SELECT * FROM legal_pages WHERE id = ?", [req.params.id]);
  if (!page) return error(res, "Página no encontrada", 404);
  success(res, page);
};

exports.create = (req, res) => {
  const { title, content } = req.body;
  if (!title) return error(res, "Título requerido", 400);
  const id = generateId();
  const slug = slugify(title);
  run("INSERT INTO legal_pages (id, title, slug, content) VALUES (?, ?, ?, ?)", [id, title, slug, content || ""]);
  success(res, { id }, "Página creada", 201);
};

exports.update = (req, res) => {
  const { title, content, is_published } = req.body;
  const existing = get("SELECT id FROM legal_pages WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Página no encontrada", 404);
  run("UPDATE legal_pages SET title = COALESCE(?, title), content = COALESCE(?, content), is_published = COALESCE(?, is_published), updated_at = datetime('now') WHERE id = ?",
    [title || null, content || null, is_published != null ? is_published : null, req.params.id]);
  success(res, null, "Página actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM legal_pages WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Página no encontrada", 404);
  run("DELETE FROM legal_pages WHERE id = ?", [req.params.id]);
  success(res, null, "Página eliminada");
};