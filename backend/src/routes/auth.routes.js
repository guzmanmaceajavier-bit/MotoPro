const router = require("express").Router();
const { wrapController } = require("../utils/helpers");
const authCtrl = wrapController(require("../controllers/auth.controller"));
const customerAuthCtrl = wrapController(require("../controllers/customer-auth.controller"));
const usersCtrl = wrapController(require("../controllers/users.controller"));
const rolesCtrl = wrapController(require("../controllers/roles.controller"));
const { verifyToken, requirePermission } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post("/auth/login", validate({ body: { email: { required: true, email: true }, password: { required: true, minLength: 4 } } }), authCtrl.login);
router.post("/auth/register", validate({ body: { name: { required: true, minLength: 2 }, email: { required: true, email: true }, password: { required: true, minLength: 6 } } }), authCtrl.register);
router.get("/auth/me", verifyToken, authCtrl.me);
router.put("/auth/profile", verifyToken, authCtrl.updateProfile);

router.post("/customer-auth/register", validate({ body: { name: { required: true, minLength: 2 }, email: { required: true, email: true }, password: { required: true, minLength: 6 }, phone: { required: true, minLength: 7 } } }), customerAuthCtrl.register);
router.post("/customer-auth/login", validate({ body: { email: { required: true, email: true }, password: { required: true, minLength: 4 } } }), customerAuthCtrl.login);
router.post("/customer-auth/forgot-password", validate({ body: { email: { required: true, email: true } } }), customerAuthCtrl.forgotPassword);
router.post("/customer-auth/reset-password", validate({ body: { token: { required: true }, password: { required: true, minLength: 6 } } }), customerAuthCtrl.resetPassword);
router.post("/customer-auth/verify-email", validate({ body: { token: { required: true } } }), customerAuthCtrl.verifyEmail);
router.post("/customer-auth/refresh", customerAuthCtrl.refresh);
router.post("/customer-auth/resend-verification", verifyToken, customerAuthCtrl.resendVerification);
router.get("/customer-auth/me", verifyToken, customerAuthCtrl.me);
router.put("/customer-auth/profile", verifyToken, customerAuthCtrl.updateProfile);
router.get("/customer-auth/orders", verifyToken, customerAuthCtrl.orders);
router.get("/customer-auth/orders/:id", verifyToken, customerAuthCtrl.orderDetail);
router.get("/customer-auth/addresses", verifyToken, customerAuthCtrl.addresses);
router.post("/customer-auth/addresses", verifyToken, customerAuthCtrl.createAddress);
router.put("/customer-auth/addresses/:id", verifyToken, customerAuthCtrl.updateAddress);
router.delete("/customer-auth/addresses/:id", verifyToken, customerAuthCtrl.deleteAddress);
router.get("/customer-auth/wishlist", verifyToken, customerAuthCtrl.wishlist);
router.post("/customer-auth/wishlist", verifyToken, customerAuthCtrl.addWishlist);
router.delete("/customer-auth/wishlist/:productId", verifyToken, customerAuthCtrl.removeWishlist);

router.get("/users", verifyToken, requirePermission("users.read"), usersCtrl.list);
router.get("/users/:id", verifyToken, requirePermission("users.read"), usersCtrl.getById);
router.post("/users", verifyToken, requirePermission("users.write"), usersCtrl.create);
router.put("/users/:id", verifyToken, requirePermission("users.write"), usersCtrl.update);
router.delete("/users/:id", verifyToken, requirePermission("users.delete"), usersCtrl.remove);

router.get("/roles", verifyToken, requirePermission("roles.read"), rolesCtrl.list);
router.get("/roles/:id", verifyToken, requirePermission("roles.read"), rolesCtrl.getById);
router.post("/roles", verifyToken, requirePermission("roles.write"), rolesCtrl.create);
router.put("/roles/:id", verifyToken, requirePermission("roles.write"), rolesCtrl.update);
router.delete("/roles/:id", verifyToken, requirePermission("roles.delete"), rolesCtrl.remove);

module.exports = router;
