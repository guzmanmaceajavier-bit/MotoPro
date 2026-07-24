const router = require("express").Router();
const mercadopagoCtrl = require("../controllers/mercadopago.controller");
const uploadCtrl = require("../controllers/upload.controller");
const { verifyToken, requirePermission } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { query, get } = require("../config/database");
const { cache } = require("../middleware/cache");

router.get("/search", cache(120), (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) return res.json({ results: [] });
  const like = `%${q}%`;
  const products = query("SELECT id, name, slug, price, image FROM products WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?) LIMIT 5", [like, like]).map(p => ({ ...p, type: "product" }));
  const services = query("SELECT id, title as name, slug, description FROM services WHERE is_active = 1 AND (title LIKE ? OR description LIKE ?) LIMIT 3", [like, like]).map(s => ({ ...s, type: "service" }));
  const posts = query("SELECT id, title as name, title, excerpt FROM blog_posts WHERE is_published = 1 AND (title LIKE ? OR excerpt LIKE ?) LIMIT 3", [like, like]).map(p => ({ ...p, name: p.title, type: "post" }));
  res.json({ results: [...products, ...services, ...posts], total: 0 });
});

router.post("/mercadopago/create-preference", mercadopagoCtrl.createPreference);
router.post("/mercadopago/webhook", mercadopagoCtrl.webhook);
router.get("/mercadopago/payment/:payment_id", mercadopagoCtrl.getPaymentStatus);

router.post("/upload", verifyToken, upload.single("image"), uploadCtrl.uploadImage);

module.exports = router;
