const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");
const { notifyAdmin } = require("../utils/notifications");

exports.list = (req, res) => {
  const { read } = req.query;
  let sql = "SELECT * FROM contacts";
  const params = [];
  if (read === "0" || read === "1") { sql += " WHERE is_read = ?"; params.push(parseInt(read)); }
  sql += " ORDER BY created_at DESC";
  success(res, query(sql, params));
};

exports.create = (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) return error(res, "Nombre, email y mensaje requeridos", 400);
  const id = generateId();
  run("INSERT INTO contacts (id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)", [id, name, email, phone || "", message]);
  notifyAdmin("Nuevo mensaje de contacto", `<h1>Nuevo mensaje de contacto</h1>
    <p><b>Nombre:</b> ${name}<br><b>Email:</b> ${email}<br>${phone ? `<b>Teléfono:</b> ${phone}<br>` : ""}
    <b>Mensaje:</b> ${message}</p>`);
  success(res, null, "Mensaje recibido", 201);
};

exports.markRead = (req, res) => {
  const existing = get("SELECT id FROM contacts WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Mensaje no encontrado", 404);
  run("UPDATE contacts SET is_read = 1 WHERE id = ?", [req.params.id]);
  success(res, null, "Marcado como leído");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM contacts WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Mensaje no encontrado", 404);
  run("DELETE FROM contacts WHERE id = ?", [req.params.id]);
  success(res, null, "Mensaje eliminado");
};
