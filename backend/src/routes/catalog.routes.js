const router = require("express").Router();
const { wrapController } = require("../utils/helpers");
const productsCtrl = wrapController(require("../controllers/products.controller"));
const categoriesCtrl = wrapController(require("../controllers/categories.controller"));
const brandsCtrl = wrapController(require("../controllers/brands.controller"));
const servicesCtrl = wrapController(require("../controllers/services.controller"));
const serviceCatsCtrl = wrapController(require("../controllers/service-categories.controller"));
const reviewsCtrl = wrapController(require("../controllers/reviews.controller"));
const { verifyToken, requirePermission } = require("../middleware/auth");
const { cache } = require("../middleware/cache");

router.get("/products/featured", cache(300), productsCtrl.featured);
router.get("/products/stock-alerts", verifyToken, requirePermission("inventory.read"), productsCtrl.getStockAlerts);
router.get("/products/physical-count", verifyToken, requirePermission("inventory.read"), productsCtrl.getPhysicalCounts);
router.get("/products", cache(300), productsCtrl.list);
router.get("/products/slug/:slug", cache(300), productsCtrl.getBySlug);
router.get("/products/:id", cache(300), productsCtrl.getById);
router.post("/products", verifyToken, requirePermission("products.write"), productsCtrl.create);
router.put("/products/:id", verifyToken, requirePermission("products.write"), productsCtrl.update);
router.delete("/products/:id", verifyToken, requirePermission("products.delete"), productsCtrl.remove);
router.post("/products/:id/adjust-stock", verifyToken, requirePermission("inventory.write"), productsCtrl.adjustStock);
router.post("/products/physical-count/start", verifyToken, requirePermission("inventory.write"), productsCtrl.startPhysicalCount);
router.post("/products/physical-count/submit", verifyToken, requirePermission("inventory.write"), productsCtrl.submitPhysicalCount);
router.put("/products/physical-count/:countId/approve", verifyToken, requirePermission("inventory.write"), productsCtrl.approvePhysicalCount);

router.get("/categories", cache(300), categoriesCtrl.list);
router.get("/categories/id/:id", cache(300), categoriesCtrl.getById);
router.get("/categories/:slug", cache(300), categoriesCtrl.getBySlug);
router.post("/categories", verifyToken, requirePermission("categories.write"), categoriesCtrl.create);
router.put("/categories/:id", verifyToken, requirePermission("categories.write"), categoriesCtrl.update);
router.delete("/categories/:id", verifyToken, requirePermission("categories.delete"), categoriesCtrl.remove);
router.get("/categories/:categoryId/subcategories", categoriesCtrl.listSubcategories);
router.post("/categories/:categoryId/subcategories", verifyToken, requirePermission("categories.write"), categoriesCtrl.createSubcategory);
router.put("/subcategories/:id", verifyToken, requirePermission("categories.write"), categoriesCtrl.updateSubcategory);
router.delete("/subcategories/:id", verifyToken, requirePermission("categories.delete"), categoriesCtrl.removeSubcategory);

router.get("/brands", cache(300), brandsCtrl.list);
router.get("/brands/:id", cache(300), brandsCtrl.getById);
router.post("/brands", verifyToken, requirePermission("brands.write"), brandsCtrl.create);
router.put("/brands/:id", verifyToken, requirePermission("brands.write"), brandsCtrl.update);
router.delete("/brands/:id", verifyToken, requirePermission("brands.delete"), brandsCtrl.remove);

router.get("/services", cache(300), servicesCtrl.list);
router.get("/services/slug/:slug", (req, res) => {
  const { success, error } = require("../utils/helpers");
  const { get } = require("../config/database");
  try {
    const service = get("SELECT * FROM services WHERE slug = ? AND is_active = 1", [req.params.slug]);
    if (!service) return error(res, "Servicio no encontrado", 404);
    if (service.features && typeof service.features === "string") service.features = JSON.parse(service.features);
    success(res, service);
  } catch (err) { console.error(err); error(res, "Error al obtener servicio", 500); }
});
router.get("/services/:id", cache(300), servicesCtrl.getById);
router.post("/services", verifyToken, requirePermission("services.write"), servicesCtrl.create);
router.put("/services/:id", verifyToken, requirePermission("services.write"), servicesCtrl.update);
router.delete("/services/:id", verifyToken, requirePermission("services.delete"), servicesCtrl.remove);

router.get("/service-categories", cache(300), serviceCatsCtrl.list);
router.get("/service-categories/:id", cache(300), serviceCatsCtrl.getById);
router.post("/service-categories", verifyToken, requirePermission("categories.write"), serviceCatsCtrl.create);
router.put("/service-categories/:id", verifyToken, requirePermission("categories.write"), serviceCatsCtrl.update);
router.delete("/service-categories/:id", verifyToken, requirePermission("categories.delete"), serviceCatsCtrl.remove);

router.get("/reviews", cache(300), reviewsCtrl.list);
router.get("/reviews/:id", cache(300), reviewsCtrl.getById);
router.post("/reviews", reviewsCtrl.create);
router.put("/reviews/:id/approve", verifyToken, requirePermission("reviews.approve"), reviewsCtrl.approve);
router.delete("/reviews/:id", verifyToken, requirePermission("reviews.delete"), reviewsCtrl.remove);



module.exports = router;
