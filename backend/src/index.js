const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const { noCache, cache, invalidateOnWrite } = require("./middleware/cache");
const { initDatabase, get, run, query } = require("./config/database");
const { startScheduler } = require("./utils/scheduler");
const { auditLogger } = require("./utils/settings");
const { verifyToken, requirePermission } = require("./middleware/auth");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } }));
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003", "http://192.168.101.11:3000", "http://192.168.101.11:3002", "http://192.168.101.11:3003"],
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(auditLogger);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: "Demasiados intentos, intenta en 15 minutos" } });
app.use("/api/auth", noCache(), authLimiter);
app.use("/api/customer-auth", noCache(), authLimiter);

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: "Demasiadas solicitudes, intenta en 15 minutos" } });
app.use("/api/contact", noCache(), formLimiter);
app.use("/api/checkout", noCache(), formLimiter);

const orderLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: "Demasiadas solicitudes, intenta en 15 minutos" } });
app.use("/api/orders", noCache(), orderLimiter);
app.use("/api/service-requests", noCache(), orderLimiter);
const storeOrderLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/store-orders", noCache(), storeOrderLimiter);

app.use("/uploads", cache(86400), express.static(path.resolve(__dirname, "../uploads")));

app.use("/api", require("./routes/auth.routes"));
app.use("/api", require("./routes/catalog.routes"));
app.use("/api", require("./routes/workshop.routes"));
app.use("/api", require("./routes/sales.routes"));
app.use("/api", require("./routes/clients.routes"));
app.use("/api", require("./routes/inventory.routes"));
app.use("/api", require("./routes/content.routes"));
app.use("/api", require("./routes/system.routes"));
app.use("/api", require("./routes/misc.routes"));

app.use("/api/surveys", noCache(), verifyToken, require("./routes/surveys.routes"));
app.use("/api/reports", verifyToken, requirePermission("orders.read"), require("./routes/reports.routes"));
app.use("/api/whatsapp-admin", verifyToken, requirePermission("settings.read"), require("./routes/whatsapp-admin.routes"));
app.use("/api/loyalty", verifyToken, requirePermission("loyalty.read"), require("./routes/loyalty.routes"));
app.use("/api/warehouses", require("./routes/warehouses.routes"));
app.use("/api/client", noCache(), require("./routes/client.routes"));

app.delete("/api/upload/:public_id", noCache(), require("./middleware/auth").verifyToken, require("./controllers/upload.controller").deleteImage);

app.get("/api/backup", noCache(), verifyToken, requirePermission("settings.read"), (req, res) => {
  const dbPath = path.resolve(__dirname, "../data/database.sqlite");
  res.download(dbPath, `backup-${new Date().toISOString().split("T")[0]}.sqlite`);
});

// Swagger API docs
app.get("/api/docs.json", (req, res) => { res.json(require("./docs/swagger")); });

const SITE_URL = process.env.SITE_URL || "https://tallermotos.com";

app.get("/robots.txt", cache(86400), (req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`);
});

app.get("/sitemap.xml", cache(86400), async (req, res) => {
  const products = query("SELECT slug, updated_at FROM products WHERE is_active = 1");
  const posts = query("SELECT id, created_at FROM blog_posts WHERE is_published = 1");
  const services = query("SELECT slug FROM services WHERE is_active = 1");
  const urls = [
    { loc: "/", priority: 1.0 },
    { loc: "/tienda", priority: 0.9 },
    { loc: "/servicios", priority: 0.9 },
    { loc: "/blog", priority: 0.8 },
    { loc: "/galeria", priority: 0.8 },
    { loc: "/contacto", priority: 0.7 },
    ...products.map((p) => ({ loc: `/tienda/${p.slug}`, priority: 0.7, lastmod: p.updated_at })),
    ...posts.map((p) => ({ loc: `/blog/${p.id}`, priority: 0.6, lastmod: p.created_at })),
    ...services.map((s) => ({ loc: `/servicios/${s.slug}`, priority: 0.6 })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.split(" ")[0]}</lastmod>` : ""}<priority>${u.priority}</priority></url>`).join("\n")}
</urlset>`;
  res.header("Content-Type", "application/xml").send(xml);
});

app.get("/api/health", cache(60), (req, res) => {
  res.json({ success: true, message: "API funcionando", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
});

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET no está configurado en el archivo .env");
  process.exit(1);
}

initDatabase().then(() => {
  const adminExists = get("SELECT id FROM users LIMIT 1");
  if (!adminExists) {
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    const hashed = bcrypt.hashSync(generatedPassword, 10);
    run("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      ["user-admin-001", "Admin", "admin@motopro.com", hashed, "superadmin"]);
    console.log("  ⚠️  Admin creado con email: admin@motopro.com");
    console.log(`  🔑  Password: ${generatedPassword}`);
    console.log("  ⚠️  GUARDA ESTA CONTRASEÑA. No se mostrará nuevamente.");
  }

  app.listen(PORT, () => {
    console.log(`MotoPro API corriendo en http://localhost:${PORT}`);
    startScheduler();
  });
});
