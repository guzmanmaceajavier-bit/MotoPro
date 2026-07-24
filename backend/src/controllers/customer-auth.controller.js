const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

exports.register = (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return error(res, "Nombre, email y contraseña requeridos", 400);
    if (password.length < 6) return error(res, "La contraseña debe tener al menos 6 caracteres", 400);
    const exists = get("SELECT id FROM customers WHERE email = ?", [email]);
    if (exists) return error(res, "El email ya está registrado", 400);
    const id = generateId();
    const hashed = bcrypt.hashSync(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 86400000).toISOString();
    run("INSERT INTO customers (id, name, email, password, phone, verify_token, verify_expires) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, name, email, hashed, phone || "", verifyToken, verifyExpires]);
    const { sendMail } = require("../utils/notifications");
    sendMail({
      to: email,
      subject: "Verifica tu email - Taller Motos",
      html: `<h1>Bienvenido, ${name}</h1><p>Gracias por registrarte. Verifica tu email haciendo clic en el enlace:</p>
      <a href="${process.env.SITE_URL || "http://localhost:3000"}/verificar-email?token=${verifyToken}" style="display:inline-block;padding:12px 24px;background:#8B5CF6;color:white;border-radius:8px;text-decoration:none">Verificar email</a>
      <p>Este enlace expira en 24 horas.</p>`
    });
    const token = jwt.sign({ id, email, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "30d" });
    success(res, { token, user: { id, name, email, phone: phone || "", email_verified: 0 } }, "Cuenta creada. Revisa tu email para verificar tu cuenta.", 201);
  } catch (err) {
    console.error("Customer register error:", err);
    error(res, "Error al crear cuenta", 500);
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, "Email y contraseña requeridos", 400);
    const customer = get("SELECT * FROM customers WHERE email = ?", [email]);
    if (!customer) return error(res, "Credenciales inválidas", 401);
    const valid = bcrypt.compareSync(password, customer.password);
    if (!valid) return error(res, "Credenciales inválidas", 401);
    const token = jwt.sign({ id: customer.id, email: customer.email, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "30d" });
    const { password: _, ...userData } = customer;
    success(res, { token, user: userData }, "Inicio de sesión exitoso");
  } catch (err) {
    console.error("Customer login error:", err);
    error(res, "Error al iniciar sesión", 500);
  }
};

exports.me = (req, res) => {
  const customer = get("SELECT id, name, email, phone, address, avatar, total_orders, total_spent, email_verified, created_at FROM customers WHERE id = ?", [req.user.id]);
  if (!customer) return error(res, "Cliente no encontrado", 404);
  const orders = query("SELECT id, total, status, payment_method, created_at FROM store_orders WHERE customer_id = ? OR customer_email = ? ORDER BY created_at DESC LIMIT 20", [req.user.id, customer.email]);
  customer.orders = orders;
  const workOrders = query("SELECT id, order_number, service_type, vehicle_description, status, created_at FROM work_orders WHERE customer_id = ? OR customer_email = ? ORDER BY created_at DESC LIMIT 20", [req.user.id, customer.email]);
  customer.workOrders = workOrders;
  success(res, customer);
};

exports.updateProfile = (req, res) => {
  try {
    const { name, phone, address, nit, currentPassword, newPassword } = req.body;
    const id = req.user.id;
    const existing = get("SELECT id FROM customers WHERE id = ?", [id]);
    if (!existing) return error(res, "Cliente no encontrado", 404);

    if (currentPassword && newPassword) {
      const customer = get("SELECT password FROM customers WHERE id = ?", [id]);
      if (!customer || !bcrypt.compareSync(currentPassword, customer.password)) {
        return error(res, "Contraseña actual incorrecta", 400);
      }
      if (newPassword.length < 6) return error(res, "Mínimo 6 caracteres", 400);
      const hashed = bcrypt.hashSync(newPassword, 10);
      run("UPDATE customers SET password = ?, updated_at = datetime('now') WHERE id = ?", [hashed, id]);
      return success(res, null, "Contraseña actualizada");
    }

    run("UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), nit = COALESCE(?, nit), updated_at = datetime('now') WHERE id = ?",
      [name || null, phone || null, address || null, nit || null, id]);
    const customer = get("SELECT id, name, email, phone, address, nit FROM customers WHERE id = ?", [id]);
    success(res, customer, "Perfil actualizado");
  } catch (err) {
    console.error("Update profile error:", err);
    error(res, "Error al actualizar perfil", 500);
  }
};

exports.forgotPassword = (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, "Email requerido", 400);
    const customer = get("SELECT id FROM customers WHERE email = ?", [email]);
    if (!customer) return success(res, null, "Si el email existe, recibirás instrucciones");
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000).toISOString();
    run("UPDATE customers SET reset_token = ?, reset_expires = ? WHERE id = ?", [token, expires, customer.id]);
    const { sendMail } = require("../utils/notifications");
    sendMail({
      to: email,
      subject: "Recuperación de contraseña - Taller Motos",
      html: `<h1>Recupera tu contraseña</h1><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${process.env.SITE_URL || "http://localhost:3000"}/reset-password?token=${token}" style="display:inline-block;padding:12px 24px;background:#8B5CF6;color:white;border-radius:8px;text-decoration:none">Restablecer contraseña</a>
      <p>Este enlace expira en 1 hora.</p>`
    });
    success(res, null, "Si el email existe, recibirás instrucciones");
  } catch (err) {
    console.error("Forgot password error:", err);
    error(res, "Error al procesar solicitud", 500);
  }
};

exports.resetPassword = (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return error(res, "Token y contraseña requeridos", 400);
    if (password.length < 6) return error(res, "Mínimo 6 caracteres", 400);
    const customer = get("SELECT id FROM customers WHERE reset_token = ? AND reset_expires > ?", [token, new Date().toISOString()]);
    if (!customer) return error(res, "Token inválido o expirado", 400);
    const hashed = bcrypt.hashSync(password, 10);
    run("UPDATE customers SET password = ?, reset_token = NULL, reset_expires = NULL, updated_at = datetime('now') WHERE id = ?", [hashed, customer.id]);
    success(res, null, "Contraseña restablecida");
  } catch (err) {
    console.error("Reset password error:", err);
    error(res, "Error al restablecer contraseña", 500);
  }
};

exports.verifyEmail = (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return error(res, "Token requerido", 400);
    const customer = get("SELECT id FROM customers WHERE verify_token = ? AND verify_expires > ?", [token, new Date().toISOString()]);
    if (!customer) return error(res, "Token inválido o expirado", 400);
    run("UPDATE customers SET email_verified = 1, verify_token = NULL, verify_expires = NULL, updated_at = datetime('now') WHERE id = ?", [customer.id]);
    success(res, null, "Email verificado correctamente");
  } catch (err) {
    console.error("Verify email error:", err);
    error(res, "Error al verificar email", 500);
  }
};

exports.resendVerification = (req, res) => {
  try {
    const customer = get("SELECT id, name, email, email_verified FROM customers WHERE id = ?", [req.user.id]);
    if (!customer) return error(res, "Cliente no encontrado", 404);
    if (customer.email_verified) return error(res, "El email ya está verificado", 400);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 86400000).toISOString();
    run("UPDATE customers SET verify_token = ?, verify_expires = ? WHERE id = ?", [verifyToken, verifyExpires, customer.id]);
    const { sendMail } = require("../utils/notifications");
    sendMail({
      to: customer.email,
      subject: "Verifica tu email - Taller Motos",
      html: `<h1>Verificación de email</h1><p>Haz clic en el enlace para verificar tu email:</p>
      <a href="${process.env.SITE_URL || "http://localhost:3000"}/verificar-email?token=${verifyToken}" style="display:inline-block;padding:12px 24px;background:#8B5CF6;color:white;border-radius:8px;text-decoration:none">Verificar email</a>
      <p>Este enlace expira en 24 horas.</p>`
    });
    success(res, null, "Correo de verificación enviado");
  } catch (err) {
    console.error("Resend verification error:", err);
    error(res, "Error al enviar verificación", 500);
  }
};

// Addresses
exports.addresses = (req, res) => {
  const addr = query("SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC", [req.user.id]);
  success(res, addr);
};

exports.createAddress = (req, res) => {
  try {
    const { name, address, city, state, zip, phone, is_default } = req.body;
    if (!name || !address) return error(res, "Nombre y dirección requeridos", 400);
    const id = generateId();
    const count = get("SELECT COUNT(*) as c FROM customer_addresses WHERE customer_id = ?", [req.user.id]);
    const def = is_default || count?.c === 0 ? 1 : 0;
    if (def) run("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?", [req.user.id]);
    run("INSERT INTO customer_addresses (id, customer_id, name, address, city, state, zip, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, req.user.id, name, address, city || "", state || "", zip || "", phone || "", def]);
    success(res, { id }, "Dirección guardada", 201);
  } catch (err) { console.error(err); error(res, "Error al guardar dirección", 500); }
};

exports.updateAddress = (req, res) => {
  try {
    const addr = get("SELECT id FROM customer_addresses WHERE id = ? AND customer_id = ?", [req.params.id, req.user.id]);
    if (!addr) return error(res, "Dirección no encontrada", 404);
    const { name, address, city, state, zip, phone, is_default } = req.body;
    if (is_default) run("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?", [req.user.id]);
    run("UPDATE customer_addresses SET name = COALESCE(?, name), address = COALESCE(?, address), city = COALESCE(?, city), state = COALESCE(?, state), zip = COALESCE(?, zip), phone = COALESCE(?, phone), is_default = COALESCE(?, is_default), updated_at = datetime('now') WHERE id = ?",
      [name || null, address || null, city || null, state || null, zip || null, phone || null, is_default != null ? (is_default ? 1 : 0) : null, req.params.id]);
    success(res, null, "Dirección actualizada");
  } catch (err) { console.error(err); error(res, "Error al actualizar", 500); }
};

exports.deleteAddress = (req, res) => {
  const addr = get("SELECT id FROM customer_addresses WHERE id = ? AND customer_id = ?", [req.params.id, req.user.id]);
  if (!addr) return error(res, "Dirección no encontrada", 404);
  run("DELETE FROM customer_addresses WHERE id = ?", [req.params.id]);
  success(res, null, "Dirección eliminada");
};

// Wishlist
exports.wishlist = (req, res) => {
  const items = query(`SELECT w.id as wish_id, w.product_id, w.created_at, p.name, p.price, p.image, p.stock
    FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.customer_id = ? ORDER BY w.created_at DESC`, [req.user.id]);
  success(res, items);
};

exports.addWishlist = (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return error(res, "Producto requerido", 400);
    const exists = get("SELECT id FROM wishlist WHERE customer_id = ? AND product_id = ?", [req.user.id, product_id]);
    if (exists) return success(res, null, "Ya está en favoritos");
    const id = generateId();
    run("INSERT INTO wishlist (id, customer_id, product_id) VALUES (?, ?, ?)", [id, req.user.id, product_id]);
    success(res, { id }, "Añadido a favoritos", 201);
  } catch (err) { console.error(err); error(res, "Error al añadir", 500); }
};

exports.removeWishlist = (req, res) => {
  run("DELETE FROM wishlist WHERE customer_id = ? AND product_id = ?", [req.user.id, req.params.productId]);
  success(res, null, "Eliminado de favoritos");
};

exports.orders = (req, res) => {
  const customer = get("SELECT email FROM customers WHERE id = ?", [req.user.id]);
  if (!customer) return error(res, "Cliente no encontrado", 404);
  const orders = query("SELECT id, total, status, payment_method, created_at, 'store' as type FROM store_orders WHERE customer_email = ? ORDER BY created_at DESC", [customer.email]);
  const services = query("SELECT id, order_number, service_type, vehicle_description, status, created_at, 'service' as type FROM work_orders WHERE customer_id = ? OR customer_email = ? ORDER BY created_at DESC", [req.user.id, customer.email]);
  const combined = [...orders, ...services].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  success(res, combined);
};

exports.orderDetail = (req, res) => {
  try {
    const customer = get("SELECT email FROM customers WHERE id = ?", [req.user.id]);
    if (!customer) return error(res, "Cliente no encontrado", 404);
    const order = get("SELECT * FROM store_orders WHERE id = ? AND customer_email = ?", [req.params.id, customer.email]);
    if (!order) return error(res, "Pedido no encontrado", 404);
    if (order.items && typeof order.items === "string") order.items = JSON.parse(order.items);
    success(res, order);
  } catch (err) {
    console.error("Order detail error:", err);
    error(res, "Error al obtener pedido", 500);
  }
};
