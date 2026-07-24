const { v4: uuidv4 } = require("uuid");

function generateId() {
  return uuidv4();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function now() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function success(res, data = null, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function error(res, message = "Error", status = 500, details = null) {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(status).json(body);
}

function paginate(items, page = 1, limit = 12) {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  return {
    data: items.slice(offset, offset + limit),
    pagination: { page, limit, total, totalPages },
  };
}

module.exports = { generateId, slugify, now, success, error, paginate };
