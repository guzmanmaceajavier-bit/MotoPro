const router = require("express").Router();
const { wrapController } = require("../utils/helpers");
const customersCtrl = wrapController(require("../controllers/customers.controller"));
const vehiclesCtrl = wrapController(require("../controllers/vehicles.controller"));
const warrantiesCtrl = wrapController(require("../controllers/warranties.controller"));
const returnsCtrl = wrapController(require("../controllers/returns.controller"));
const notificationsCtrl = wrapController(require("../controllers/notifications.controller"));
const { verifyToken, requirePermission } = require("../middleware/auth");

router.get("/customers", verifyToken, requirePermission("customers.read"), customersCtrl.list);
router.get("/customers/:id", verifyToken, requirePermission("customers.read"), customersCtrl.getById);
router.get("/customers/:id/vehicles", verifyToken, requirePermission("customers.read"), customersCtrl.vehicles);
router.get("/customers/:id/notes", verifyToken, requirePermission("customers.read"), customersCtrl.notes);
router.put("/customers/:id/notes", verifyToken, requirePermission("customers.write"), customersCtrl.updateNotes);
router.get("/customers/:id/history", verifyToken, requirePermission("customers.read"), customersCtrl.history);
router.post("/customers", verifyToken, requirePermission("customers.write"), customersCtrl.create);
router.put("/customers/:id", verifyToken, requirePermission("customers.write"), customersCtrl.update);
router.delete("/customers/:id", verifyToken, requirePermission("customers.delete"), customersCtrl.remove);

router.get("/vehicles/compatibility", vehiclesCtrl.checkCompatibility);
router.get("/vehicles", verifyToken, requirePermission("services.read"), vehiclesCtrl.list);
router.get("/vehicles/:id", verifyToken, requirePermission("services.read"), vehiclesCtrl.getById);
router.post("/vehicles", verifyToken, requirePermission("services.write"), vehiclesCtrl.create);
router.put("/vehicles/:id", verifyToken, requirePermission("services.write"), vehiclesCtrl.update);
router.delete("/vehicles/:id", verifyToken, requirePermission("services.delete"), vehiclesCtrl.remove);
router.post("/vehicles/:id/photos", verifyToken, requirePermission("services.write"), vehiclesCtrl.addPhoto);
router.delete("/vehicles/:id/photos/:photoId", verifyToken, requirePermission("services.write"), vehiclesCtrl.removePhoto);
router.post("/vehicles/:id/documents", verifyToken, requirePermission("services.write"), vehiclesCtrl.addDocument);
router.delete("/vehicles/:id/documents/:docId", verifyToken, requirePermission("services.write"), vehiclesCtrl.removeDocument);
router.post("/vehicles/:id/mileage", verifyToken, requirePermission("services.write"), vehiclesCtrl.addMileage);
router.get("/vehicles/:id/mileage", verifyToken, requirePermission("services.read"), vehiclesCtrl.mileageHistory);

router.get("/warranties", verifyToken, requirePermission("orders.read"), warrantiesCtrl.list);
router.get("/warranties/:id", verifyToken, requirePermission("orders.read"), warrantiesCtrl.getById);
router.get("/warranties/customer/:customer_id", verifyToken, requirePermission("orders.read"), warrantiesCtrl.getByCustomer);
router.post("/warranties", verifyToken, requirePermission("orders.write"), warrantiesCtrl.create);
router.put("/warranties/:id", verifyToken, requirePermission("orders.write"), warrantiesCtrl.update);
router.delete("/warranties/:id", verifyToken, requirePermission("orders.delete"), warrantiesCtrl.remove);

router.get("/returns", verifyToken, requirePermission("sales.read"), returnsCtrl.list);
router.get("/returns/:id", verifyToken, requirePermission("sales.read"), returnsCtrl.getById);
router.post("/returns", verifyToken, requirePermission("sales.refund"), returnsCtrl.create);
router.put("/returns/:id", verifyToken, requirePermission("sales.refund"), returnsCtrl.update);
router.delete("/returns/:id", verifyToken, requirePermission("sales.refund"), returnsCtrl.remove);

router.get("/notifications", verifyToken, notificationsCtrl.list);
router.post("/notifications", verifyToken, notificationsCtrl.create);
router.put("/notifications/:id/read", verifyToken, notificationsCtrl.markRead);
router.put("/notifications/read-all", verifyToken, notificationsCtrl.markAllRead);
router.delete("/notifications/:id", verifyToken, notificationsCtrl.remove);

module.exports = router;
