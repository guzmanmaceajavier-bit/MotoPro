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
  if (details) { body.errors = details; body.details = details; }
  return res.status(status).json(body);
}

// Envelope estandarizado: { success, message, data, meta, pagination, errors }
function ok(res, data = null, options = {}) {
  const { meta, pagination, message = "OK", status = 200 } = options;
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  if (pagination) body.pagination = pagination;
  return res.status(status).json(body);
}

function camelizeKey(key) {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// Convierte recursivamente claves snake_case -> camelCase
function camelize(value) {
  if (Array.isArray(value)) return value.map(camelize);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[camelizeKey(k)] = camelize(v);
    }
    return out;
  }
  return value;
}

// Convierte filas de BD en series de gráfico { label, value }
function toSeries(rows = [], labelKey, valueKey, valueFn) {
  return rows.map((row) => ({
    label: String(row[labelKey] ?? "—"),
    value: Number(valueFn ? valueFn(row) : row[valueKey]) || 0,
  }));
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

function wrapHandler(fn) {
  return (req, res, next) => {
    try { fn(req, res, next); } catch (err) { next(err); }
  };
}

function wrapController(ctrl) {
  const wrapped = {};
  for (const key of Object.keys(ctrl)) {
    if (typeof ctrl[key] === "function") {
      wrapped[key] = wrapHandler(ctrl[key]);
    } else {
      wrapped[key] = ctrl[key];
    }
  }
  return wrapped;
}

module.exports = { generateId, slugify, now, success, error, ok, camelize, camelizeKey, toSeries, paginate, wrapHandler, wrapController };
