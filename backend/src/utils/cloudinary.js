const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

function publicIdFromUrl(url) {
  if (!url || !hasCloudinary) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/);
  return match ? match[1] : null;
}

async function destroyImage(url) {
  const publicId = publicIdFromUrl(url);
  if (publicId && hasCloudinary) {
    try { await cloudinary.uploader.destroy(publicId); } catch {}
  }
}

async function uploadToCloudinary(buffer, folder = 'taller-motos') {
  if (!hasCloudinary) {
    const { saveFileLocally } = require('./file');
    const url = saveFileLocally(buffer, 'upload.jpg');
    return { secure_url: url, public_id: null, width: 0, height: 0 };
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

module.exports = { destroyImage, publicIdFromUrl, hasCloudinary, uploadToCloudinary };
