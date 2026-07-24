const { query, get, run } = require("../config/database");
const { generateId, slugify, success, error } = require("../utils/helpers");
const { destroyImage } = require("../utils/cloudinary");

exports.list = (req, res) => {
  const { category, all, page = 1, limit = 12 } = req.query;
  let sql = "SELECT * FROM blog_posts";
  const params = [];
  const conditions = [];
  if (all !== "1") conditions.push("is_published = 1");
  if (category) conditions.push("category = ?");
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  if (category) params.push(category);
  sql += " ORDER BY created_at DESC";
  const items = query(sql, params);
  const { paginate } = require("../utils/helpers");
  success(res, paginate(items, parseInt(page), parseInt(limit)));
};

exports.getById = (req, res) => {
  const post = get("SELECT * FROM blog_posts WHERE id = ?", [req.params.id]);
  if (!post) return error(res, "Artículo no encontrado", 404);
  success(res, post);
};

exports.getBySlug = (req, res) => {
  const post = get("SELECT * FROM blog_posts WHERE slug = ?", [req.params.slug]);
  if (!post) return error(res, "Artículo no encontrado", 404);
  success(res, post);
};

exports.create = (req, res) => {
  const { title, excerpt, content, category, author, image, gradient } = req.body;
  if (!title) return error(res, "Título requerido", 400);
  const id = generateId();
  const slug = slugify(title);
  run("INSERT INTO blog_posts (id, title, slug, excerpt, content, category, author, image, gradient) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, title, slug, excerpt || "", content || "", category || "", author || "", image || null, gradient || ""]);
  success(res, { id }, "Artículo creado", 201);
};

exports.update = (req, res) => {
  const { title, excerpt, content, category, author, image, gradient, is_published } = req.body;
  const existing = get("SELECT id, image FROM blog_posts WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Artículo no encontrado", 404);
  if (image && image !== existing.image) destroyImage(existing.image);
  run(`UPDATE blog_posts SET title = COALESCE(?, title), excerpt = COALESCE(?, excerpt),
    content = COALESCE(?, content), category = COALESCE(?, category), author = COALESCE(?, author),
    image = COALESCE(?, image), gradient = COALESCE(?, gradient),
    is_published = COALESCE(?, is_published), updated_at = datetime('now') WHERE id = ?`,
    [title || null, excerpt || null, content || null, category || null, author || null,
      image || null, gradient || null, is_published != null ? is_published : null, req.params.id]);
  success(res, null, "Artículo actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id, image FROM blog_posts WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Artículo no encontrado", 404);
  destroyImage(existing.image);
  run("DELETE FROM blog_posts WHERE id = ?", [req.params.id]);
  success(res, null, "Artículo eliminado");
};
