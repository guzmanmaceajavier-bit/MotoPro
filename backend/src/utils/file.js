const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

function saveFileLocally(buffer, originalname) {
  const uploadDir = path.resolve(__dirname, "../..", process.env.UPLOAD_DIR || "./uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const ext = path.extname(originalname);
  const filename = `${uuidv4()}${ext}`;
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

function getImageUrl(req) {
  if (!req.file) return null;
  return saveFileLocally(req.file.buffer, req.file.originalname);
}

module.exports = { saveFileLocally, getImageUrl };
