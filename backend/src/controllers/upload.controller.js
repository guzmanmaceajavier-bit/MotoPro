const cloudinary = require('../utils/cloudinary');
const { saveFileLocally } = require("../utils/file");
const { success, error } = require("../utils/helpers");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return error(res, "No se envió ninguna imagen", 400);

    const folder = req.body.folder || 'taller-motos/misc';
    const result = await cloudinary.uploadToCloudinary(req.file.buffer, folder);
    return success(res, { url: result.secure_url, public_id: result.public_id }, "Imagen subida a Cloudinary");
  } catch (err) {
    error(res, "Error al subir imagen: " + err.message, 500);
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { public_id } = req.params;
    if (public_id) {
      await cloudinary.destroyImage(public_id);
    }
    success(res, null, "Imagen eliminada");
  } catch (err) {
    error(res, "Error al eliminar imagen", 500);
  }
};
