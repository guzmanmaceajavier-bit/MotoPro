const cloudinary = require("cloudinary").v2;
const { saveFileLocally } = require("../utils/file");
const { success, error } = require("../utils/helpers");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return error(res, "No se envió ninguna imagen", 400);

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "taller-motos", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      return success(res, { url: result.secure_url, public_id: result.public_id }, "Imagen subida a Cloudinary");
    }

    const url = saveFileLocally(req.file.buffer, req.file.originalname);
    success(res, { url, public_id: null }, "Imagen subida localmente");
  } catch (err) {
    error(res, "Error al subir imagen: " + err.message, 500);
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { public_id } = req.params;
    if (public_id && process.env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.uploader.destroy(public_id);
    }
    success(res, null, "Imagen eliminada");
  } catch (err) {
    error(res, "Error al eliminar imagen", 500);
  }
};
