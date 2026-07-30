const router = require("express").Router();
const { wrapController } = require("../utils/helpers");
const cartCtrl = wrapController(require("../controllers/cart.controller"));
const checkoutCtrl = wrapController(require("../controllers/checkout.controller"));
const invoicesCtrl = wrapController(require("../controllers/invoices.controller"));
const cashRegisterCtrl = wrapController(require("../controllers/cash-register.controller"));
const cashTxCtrl = wrapController(require("../controllers/cash-transactions.controller"));
const couponsCtrl = wrapController(require("../controllers/coupons.controller"));
const shippingCtrl = wrapController(require("../controllers/shipping.controller"));
const paymentMethodsCtrl = wrapController(require("../controllers/payment-methods.controller"));
const directSalesCtrl = wrapController(require("../controllers/direct-sales.controller"));
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
router.get("/checkout/:id", verifyToken, checkoutCtrl.getById);
const validate = require("../middleware/validate");
router.post("/checkout", validate({
  body: {
    customer_name: { required: true, type: "string", minLength: 2 },
    customer_email: { required: true, type: "string", email: true },
    items: { required: true, type: "array" },
    payment_method: { required: true, type: "string", oneOf: ["mercadopago", "transferencia", "contraentrega"] },
    total: { required: true, type: "number", min: 0 },
  }
}), checkoutCtrl.create);
router.put("/checkout/:id/status", verifyToken, requirePermission("orders.status"), checkoutCtrl.updateStatus);

router.get("/invoices", verifyToken, requirePermission("orders.read"), invoicesCtrl.list);
router.get("/invoices/:id", verifyToken, requirePermission("orders.read"), invoicesCtrl.getById);
router.get("/invoices/order/:order_id", verifyToken, requirePermission("orders.read"), invoicesCtrl.getByOrder);
router.post("/invoices", verifyToken, requirePermission("orders.write"), invoicesCtrl.create);
router.patch("/invoices/:id/status", verifyToken, requirePermission("orders.write"), invoicesCtrl.updateStatus);

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

// Export routes
const exportCtrl = wrapController(require("../controllers/export.controller"));
router.get("/invoices/:id/pdf", verifyToken, requirePermission("orders.read"), exportCtrl.exportInvoice);
router.get("/quotes/:id/pdf", verifyToken, requirePermission("orders.read"), exportCtrl.exportQuote);

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
