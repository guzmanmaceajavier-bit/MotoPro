const router = require("express").Router();
const { wrapController } = require("../utils/helpers");
const ordersCtrl = wrapController(require("../controllers/work-orders.controller"));
const diagnosticsCtrl = wrapController(require("../controllers/diagnostics.controller"));
const quotesCtrl = wrapController(require("../controllers/quotes.controller"));
const timelineCtrl = wrapController(require("../controllers/timeline.controller"));
const appointmentsCtrl = wrapController(require("../controllers/appointments.controller"));
const mechanicsCtrl = wrapController(require("../controllers/mechanics.controller"));
const holidaysCtrl = wrapController(require("../controllers/holidays.controller"));
const upload = require("../middleware/upload");
const { verifyToken, requirePermission, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/orders/search", ordersCtrl.search);
router.get("/orders", verifyToken, requirePermission("orders.read"), ordersCtrl.list);
router.get("/orders/:id", verifyToken, requirePermission("orders.read"), ordersCtrl.getById);
router.post("/orders", ordersCtrl.create);
router.put("/orders/:id", verifyToken, requirePermission("orders.write"), ordersCtrl.update);
router.delete("/orders/:id", verifyToken, requirePermission("orders.delete"), ordersCtrl.remove);
router.put("/orders/:id/status", verifyToken, requirePermission("orders.write"), ordersCtrl.updateStatus);
router.put("/orders/:id/reception", verifyToken, requirePermission("orders.write"), ordersCtrl.reception);
router.put("/orders/:id/diagnostic", verifyToken, requirePermission("orders.write"), ordersCtrl.updateDiagnostic);
router.post("/orders/:id/quotes", verifyToken, requirePermission("orders.write"), ordersCtrl.createQuote);
router.put("/orders/quotes/:quoteId/approve", verifyToken, ordersCtrl.approveQuote);
router.put("/orders/quotes/:quoteId/reject", verifyToken, ordersCtrl.rejectQuote);
router.put("/orders/:id/start-repair", verifyToken, requirePermission("orders.write"), ordersCtrl.startRepair);
router.post("/orders/:id/parts", verifyToken, requirePermission("orders.write"), ordersCtrl.addPart);
router.delete("/orders/:id/parts/:partId", verifyToken, requirePermission("orders.write"), ordersCtrl.removePart);
router.put("/orders/:id/quality-check", verifyToken, requirePermission("orders.write"), ordersCtrl.qualityCheck);
router.post("/orders/:id/deliver", verifyToken, requirePermission("orders.write"), ordersCtrl.deliver);
router.post("/orders/:id/timeline", verifyToken, requirePermission("orders.write"), ordersCtrl.addTimelineEvent);

router.get("/service-requests/search", ordersCtrl.search);
router.get("/service-requests", verifyToken, requirePermission("services.read"), ordersCtrl.list);
router.get("/service-requests/:id", verifyToken, requirePermission("services.read"), ordersCtrl.getById);
router.post("/service-requests", optionalAuth, validate({
  body: {
    customer_name: { required: true, type: "string", minLength: 2 },
    customer_phone: { required: true, type: "string" },
    brand_model: { required: true, type: "string" },
    problem: { required: true, type: "string", minLength: 5 },
  }
}), ordersCtrl.create);
router.put("/service-requests/:id", verifyToken, requirePermission("services.write"), ordersCtrl.update);
router.delete("/service-requests/:id", verifyToken, requirePermission("services.delete"), ordersCtrl.remove);

router.get("/diagnostics/work-order/:workOrderId", verifyToken, requirePermission("orders.read"), diagnosticsCtrl.getByWorkOrder);
router.post("/diagnostics", verifyToken, requirePermission("orders.write"), diagnosticsCtrl.create);
router.put("/diagnostics/:id", verifyToken, requirePermission("orders.write"), diagnosticsCtrl.update);

router.get("/quotes", verifyToken, requirePermission("orders.read"), quotesCtrl.list);
router.get("/quotes/:id", verifyToken, requirePermission("orders.read"), quotesCtrl.getById);
router.post("/quotes", verifyToken, requirePermission("orders.write"), quotesCtrl.create);
router.put("/quotes/:id", verifyToken, requirePermission("orders.write"), quotesCtrl.update);
router.post("/quotes/:id/send", verifyToken, requirePermission("orders.write"), quotesCtrl.send);
router.post("/quotes/:id/approve", verifyToken, quotesCtrl.approve);
router.post("/quotes/:id/reject", verifyToken, quotesCtrl.reject);
router.delete("/quotes/:id", verifyToken, requirePermission("orders.delete"), quotesCtrl.remove);

router.get("/timeline", timelineCtrl.list);
router.post("/timeline", verifyToken, requirePermission("orders.write"), upload.single("image"), timelineCtrl.create);
router.delete("/timeline/:id", verifyToken, requirePermission("orders.delete"), timelineCtrl.remove);

router.get("/appointments/slots", appointmentsCtrl.getAvailableSlots);
router.get("/appointments/calendar", appointmentsCtrl.getCalendar);
router.get("/appointments/day-summary", appointmentsCtrl.daySummary);
router.get("/appointments/schedule-config", verifyToken, requirePermission("orders.read"), appointmentsCtrl.scheduleConfig);
router.put("/appointments/schedule-config", verifyToken, requirePermission("orders.write"), appointmentsCtrl.updateScheduleConfig);
router.get("/appointments/my", verifyToken, appointmentsCtrl.myAppointments);
router.get("/appointments", verifyToken, requirePermission("orders.read"), appointmentsCtrl.list);
router.get("/appointments/:id", verifyToken, requirePermission("orders.read"), appointmentsCtrl.getById);
router.post("/appointments", validate({
  body: {
    customer_name: { required: true, type: "string", minLength: 2 },
    customer_phone: { required: true, type: "string" },
    service_type: { required: true, type: "string" },
    appointment_date: { required: true, type: "string" },
    start_time: { required: true, type: "string" },
  }
}), appointmentsCtrl.create);
router.put("/appointments/:id", verifyToken, requirePermission("orders.write"), appointmentsCtrl.update);
router.delete("/appointments/:id", verifyToken, requirePermission("orders.delete"), appointmentsCtrl.remove);

router.get("/mechanics", mechanicsCtrl.list);
router.get("/mechanics/:id", mechanicsCtrl.getById);
router.post("/mechanics", verifyToken, requirePermission("team.write"), mechanicsCtrl.create);
router.put("/mechanics/:id", verifyToken, requirePermission("team.write"), mechanicsCtrl.update);
router.delete("/mechanics/:id", verifyToken, requirePermission("team.delete"), mechanicsCtrl.remove);

router.get("/holidays/check", holidaysCtrl.checkDate);
router.get("/holidays", verifyToken, requirePermission("orders.read"), holidaysCtrl.list);
router.post("/holidays", verifyToken, requirePermission("orders.write"), holidaysCtrl.create);
router.put("/holidays/:id", verifyToken, requirePermission("orders.write"), holidaysCtrl.update);
router.delete("/holidays/:id", verifyToken, requirePermission("orders.delete"), holidaysCtrl.remove);

module.exports = router;
