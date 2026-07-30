const router = require("express").Router();
const { wrapController } = require("../utils/helpers");
const inventoryCtrl = wrapController(require("../controllers/inventory.controller"));
const purchasesCtrl = wrapController(require("../controllers/purchases.controller"));
const suppliersCtrl = wrapController(require("../controllers/suppliers.controller"));
const { verifyToken, requirePermission } = require("../middleware/auth");

router.get("/inventory/summary", verifyToken, requirePermission("inventory.read"), inventoryCtrl.getSummary);
router.get("/inventory/alerts", verifyToken, requirePermission("inventory.read"), inventoryCtrl.getStockAlerts);
router.get("/inventory", verifyToken, requirePermission("inventory.read"), inventoryCtrl.list);
router.get("/inventory/:id", verifyToken, requirePermission("inventory.read"), inventoryCtrl.getById);
router.post("/inventory", verifyToken, requirePermission("inventory.write"), inventoryCtrl.create);

router.get("/purchases/stats", verifyToken, requirePermission("sales.read"), purchasesCtrl.getStats);
router.get("/purchases", verifyToken, requirePermission("sales.read"), purchasesCtrl.list);
router.get("/purchases/:id", verifyToken, requirePermission("sales.read"), purchasesCtrl.getById);
router.post("/purchases", verifyToken, requirePermission("sales.write"), purchasesCtrl.create);
router.put("/purchases/:id", verifyToken, requirePermission("sales.write"), purchasesCtrl.update);
router.delete("/purchases/:id", verifyToken, requirePermission("sales.refund"), purchasesCtrl.remove);
router.post("/purchases/:id/receive", verifyToken, requirePermission("sales.write"), purchasesCtrl.receive);

router.get("/suppliers", verifyToken, requirePermission("sales.read"), suppliersCtrl.list);
router.get("/suppliers/:id", verifyToken, requirePermission("sales.read"), suppliersCtrl.getById);
router.post("/suppliers", verifyToken, requirePermission("sales.write"), suppliersCtrl.create);
router.put("/suppliers/:id", verifyToken, requirePermission("sales.write"), suppliersCtrl.update);
router.delete("/suppliers/:id", verifyToken, requirePermission("sales.delete"), suppliersCtrl.remove);
router.get("/suppliers/:id/purchases", verifyToken, requirePermission("sales.read"), suppliersCtrl.getPurchases);

module.exports = router;
