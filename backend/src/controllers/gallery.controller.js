const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { destroyImage } = require("../utils/cloudinary");
const cloudinary = require("cloudinary").v2;
const { saveFileLocally } = require("../utils/file");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

async function uploadToCloudinary(buffer) {
  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "taller-motos/gallery", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result.secure_url))
      );
      stream.end(buffer);
    });
  }
  return null;
}

exports.list = (req, res) => {
  const images = query("SELECT * FROM gallery_images ORDER BY sort_order");
  success(res, images);
};

exports.create = async (req, res) => {
  try {
    const { label, size } = req.body;
    if (!req.file) return error(res, "Imagen requerida", 400);
    let image = await uploadToCloudinary(req.file.buffer);
    if (!image) image = saveFileLocally(req.file.buffer, req.file.originalname);
    const id = generateId();
    run("INSERT INTO gallery_images (id, label, image, size) VALUES (?, ?, ?, ?)", [id, label || "", image, size || "medium"]);
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
      const uploaded = await uploadToCloudinary(req.file.buffer);
      if (uploaded) image = uploaded;
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