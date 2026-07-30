const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { destroyImage, uploadToCloudinary } = require("../utils/cloudinary");
const { saveFileLocally } = require("../utils/file");

exports.list = (req, res) => {
  const { category } = req.query;
  let sql = "SELECT * FROM gallery_images";
  const params = [];
  if (category) { sql += " WHERE category = ?"; params.push(category); }
  sql += " ORDER BY sort_order";
  success(res, query(sql, params));
};

exports.create = async (req, res) => {
  try {
    const { label, size, category } = req.body;
    if (!req.file) return error(res, "Imagen requerida", 400);
    let result = await uploadToCloudinary(req.file.buffer, 'taller-motos/gallery');
    let image = result ? result.secure_url : null;
    if (!image) image = saveFileLocally(req.file.buffer, req.file.originalname);
    const id = generateId();
    run("INSERT INTO gallery_images (id, label, image, size, category) VALUES (?, ?, ?, ?, ?)", [id, label || "", image, size || "medium", category || "fotos"]);
    success(res, { id, image }, "Imagen agregada", 201);
  } catch (err) {
    error(res, "Error al subir imagen: " + err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { label, size, sort_order } = req.body;
    const existing = get("SELECT id, image FROM gallery_images WHERE id = ?", [req.params.id]);
    if (!existing) return error(res, "Imagen no encontrada", 404);
    let image = existing.image;
    if (req.file) {
      await destroyImage(existing.image);
      let result = await uploadToCloudinary(req.file.buffer, 'taller-motos/gallery');
      if (result) image = result.secure_url;
      else image = saveFileLocally(req.file.buffer, req.file.originalname);
    }
    run("UPDATE gallery_images SET label = COALESCE(?, label), image = ?, size = COALESCE(?, size), sort_order = COALESCE(?, sort_order) WHERE id = ?",
      [label || null, image, size || null, sort_order != null ? sort_order : null, req.params.id]);
    success(res, null, "Imagen actualizada");
  } catch (err) {
    error(res, "Error al actualizar imagen: " + err.message, 500);
  }
};

exports.remove = async (req, res) => {
  const existing = get("SELECT id, image FROM gallery_images WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Imagen no encontrada", 404);
  await destroyImage(existing.image);
  run("DELETE FROM gallery_images WHERE id = ?", [req.params.id]);
  success(res, null, "Imagen eliminada");
};