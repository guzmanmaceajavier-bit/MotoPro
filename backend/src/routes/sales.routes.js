const router = require("express").Router();
const cartCtrl = require("../controllers/cart.controller");
const checkoutCtrl = require("../controllers/checkout.controller");
const invoicesCtrl = require("../controllers/invoices.controller");
const cashRegisterCtrl = require("../controllers/cash-register.controller");
const cashTxCtrl = require("../controllers/cash-transactions.controller");
const couponsCtrl = require("../controllers/coupons.controller");
const shippingCtrl = require("../controllers/shipping.controller");
const paymentMethodsCtrl = require("../controllers/payment-methods.controller");
const directSalesCtrl = require("../controllers/direct-sales.controller");
const jwt = require("jsonwebtoken");
const { verifyToken, requirePermission } = require("../middleware/auth");

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try { req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET); } catch (e) {}
  }
  next();
}

router.get("/cart", optionalAuth, cartCtrl.list);
router.post("/cart", optionalAuth, cartCtrl.add);
router.put("/cart/:id", optionalAuth, cartCtrl.update);
router.delete("/cart/:id", optionalAuth, cartCtrl.remove);

router.get("/checkout", verifyToken, requirePermission("orders.read"), checkoutCtrl.list);
router.get("/checkout/:id", checkoutCtrl.getById);
router.post("/checkout", checkoutCtrl.create);
router.put("/checkout/:id/status", verifyToken, requirePermission("orders.status"), checkoutCtrl.updateStatus);

router.get("/invoices", verifyToken, requirePermission("orders.read"), invoicesCtrl.list);
router.get("/invoices/:id", verifyToken, requirePermission("orders.read"), invoicesCtrl.getById);
router.get("/invoices/order/:order_id", verifyToken, requirePermission("orders.read"), invoicesCtrl.getByOrder);
router.post("/invoices", verifyToken, requirePermission("orders.write"), invoicesCtrl.create);
router.patch("/invoices/:id/status", verifyToken, requirePermission("orders.write"), invoicesCtrl.updateStatus);
router.get("/invoices/:id/pdf", verifyToken, requirePermission("orders.read"), invoicesCtrl.generatePdf);

router.get("/cash-register/stats", verifyToken, requirePermission("settings.read"), cashRegisterCtrl.getStats);
router.get("/cash-register/history", verifyToken, requirePermission("settings.read"), cashRegisterCtrl.history);
router.get("/cash-register/arqueo", verifyToken, requirePermission("settings.read"), cashRegisterCtrl.arqueo);
router.get("/cash-register", verifyToken, requirePermission("settings.read"), cashRegisterCtrl.getCurrent);
router.post("/cash-register", verifyToken, requirePermission("settings.write"), cashRegisterCtrl.open);
router.post("/cash-register/:id/close", verifyToken, requirePermission("settings.write"), cashRegisterCtrl.close);

router.get("/cash-transactions", verifyToken, requirePermission("settings.read"), cashTxCtrl.list);
router.post("/cash-transactions", verifyToken, requirePermission("settings.write"), cashTxCtrl.create);
router.get("/cash-transactions/summary", verifyToken, requirePermission("settings.read"), cashTxCtrl.summary);

router.get("/coupons", verifyToken, requirePermission("coupons.read"), couponsCtrl.list);
router.get("/coupons/:id", verifyToken, requirePermission("coupons.read"), couponsCtrl.getById);
router.post("/coupons/validate", couponsCtrl.validate);
router.post("/coupons", verifyToken, requirePermission("coupons.write"), couponsCtrl.create);
router.put("/coupons/:id", verifyToken, requirePermission("coupons.write"), couponsCtrl.update);
router.delete("/coupons/:id", verifyToken, requirePermission("coupons.delete"), couponsCtrl.remove);

router.get("/shipping", shippingCtrl.list);
router.get("/shipping/:id", shippingCtrl.getById);
router.post("/shipping", verifyToken, requirePermission("settings.write"), shippingCtrl.create);
router.put("/shipping/:id", verifyToken, requirePermission("settings.write"), shippingCtrl.update);
router.delete("/shipping/:id", verifyToken, requirePermission("settings.write"), shippingCtrl.remove);

router.get("/payment-methods", paymentMethodsCtrl.list);
router.get("/payment-methods/:id", paymentMethodsCtrl.getById);
router.post("/payment-methods", verifyToken, requirePermission("settings.write"), paymentMethodsCtrl.create);
router.put("/payment-methods/:id", verifyToken, requirePermission("settings.write"), paymentMethodsCtrl.update);
router.delete("/payment-methods/:id", verifyToken, requirePermission("settings.write"), paymentMethodsCtrl.remove);

router.get("/direct-sales/stats", verifyToken, requirePermission("sales.read"), directSalesCtrl.getStats);
router.get("/direct-sales", verifyToken, requirePermission("sales.read"), directSalesCtrl.list);
router.get("/direct-sales/:id", verifyToken, requirePermission("sales.read"), directSalesCtrl.getById);
router.post("/direct-sales", verifyToken, requirePermission("sales.write"), directSalesCtrl.create);
router.put("/direct-sales/:id", verifyToken, requirePermission("sales.write"), directSalesCtrl.update);

module.exports = router;
