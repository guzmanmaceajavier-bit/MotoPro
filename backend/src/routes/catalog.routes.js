const router = require("express").Router();
const productsCtrl = require("../controllers/products.controller");
const categoriesCtrl = require("../controllers/categories.controller");
const brandsCtrl = require("../controllers/brands.controller");
const servicesCtrl = require("../controllers/services.controller");
const reviewsCtrl = require("../controllers/reviews.controller");
const offersCtrl = require("../controllers/offers.controller");
const faqsCtrl = require("../controllers/faqs.controller");
const { verifyToken, requirePermission } = require("../middleware/auth");

router.get("/products/featured", productsCtrl.featured);
router.get("/products/stock-alerts", verifyToken, requirePermission("inventory.read"), productsCtrl.getStockAlerts);
router.get("/products/physical-count", verifyToken, requirePermission("inventory.read"), productsCtrl.getPhysicalCounts);
router.get("/products", productsCtrl.list);
router.get("/products/slug/:slug", productsCtrl.getBySlug);
router.get("/products/:id", productsCtrl.getById);
router.post("/products", verifyToken, requirePermission("products.write"), productsCtrl.create);
router.put("/products/:id", verifyToken, requirePermission("products.write"), productsCtrl.update);
router.delete("/products/:id", verifyToken, requirePermission("products.delete"), productsCtrl.remove);
router.post("/products/:id/adjust-stock", verifyToken, requirePermission("inventory.write"), productsCtrl.adjustStock);
router.post("/products/physical-count/start", verifyToken, requirePermission("inventory.write"), productsCtrl.startPhysicalCount);
router.post("/products/physical-count/submit", verifyToken, requirePermission("inventory.write"), productsCtrl.submitPhysicalCount);
router.put("/products/physical-count/:countId/approve", verifyToken, requirePermission("inventory.write"), productsCtrl.approvePhysicalCount);

router.get("/categories", categoriesCtrl.list);
router.get("/categories/id/:id", categoriesCtrl.getById);
router.get("/categories/:slug", categoriesCtrl.getBySlug);
router.post("/categories", verifyToken, requirePermission("categories.write"), categoriesCtrl.create);
router.put("/categories/:id", verifyToken, requirePermission("categories.write"), categoriesCtrl.update);
router.delete("/categories/:id", verifyToken, requirePermission("categories.delete"), categoriesCtrl.remove);
router.get("/categories/:categoryId/subcategories", categoriesCtrl.listSubcategories);
router.post("/categories/:categoryId/subcategories", verifyToken, requirePermission("categories.write"), categoriesCtrl.createSubcategory);
router.put("/subcategories/:id", verifyToken, requirePermission("categories.write"), categoriesCtrl.updateSubcategory);
router.delete("/subcategories/:id", verifyToken, requirePermission("categories.delete"), categoriesCtrl.removeSubcategory);

router.get("/brands", brandsCtrl.list);
router.get("/brands/:id", brandsCtrl.getById);
router.post("/brands", verifyToken, requirePermission("brands.write"), brandsCtrl.create);
router.put("/brands/:id", verifyToken, requirePermission("brands.write"), brandsCtrl.update);
router.delete("/brands/:id", verifyToken, requirePermission("brands.delete"), brandsCtrl.remove);

router.get("/services", servicesCtrl.list);
router.get("/services/:id", servicesCtrl.getById);
router.post("/services", verifyToken, requirePermission("services.write"), servicesCtrl.create);
router.put("/services/:id", verifyToken, requirePermission("services.write"), servicesCtrl.update);
router.delete("/services/:id", verifyToken, requirePermission("services.delete"), servicesCtrl.remove);

router.get("/reviews", reviewsCtrl.list);
router.get("/reviews/:id", reviewsCtrl.getById);
router.post("/reviews", reviewsCtrl.create);
router.put("/reviews/:id/approve", verifyToken, requirePermission("reviews.approve"), reviewsCtrl.approve);
router.delete("/reviews/:id", verifyToken, requirePermission("reviews.delete"), reviewsCtrl.remove);

router.get("/offers", offersCtrl.list);
router.get("/offers/:id", offersCtrl.getById);
router.post("/offers", verifyToken, requirePermission("coupons.write"), offersCtrl.create);
router.put("/offers/:id", verifyToken, requirePermission("coupons.write"), offersCtrl.update);
router.delete("/offers/:id", verifyToken, requirePermission("coupons.delete"), offersCtrl.remove);

router.get("/faqs", faqsCtrl.list);
router.get("/faqs/:id", faqsCtrl.getById);
router.post("/faqs", verifyToken, requirePermission("cms.homepage"), faqsCtrl.create);
router.put("/faqs/:id", verifyToken, requirePermission("cms.homepage"), faqsCtrl.update);
router.delete("/faqs/:id", verifyToken, requirePermission("cms.homepage"), faqsCtrl.remove);

module.exports = router;
