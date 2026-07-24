const router = require("express").Router();
const { query, get, run } = require("../config/database");
const { generateId } = require("../utils/helpers");
const { verifyToken } = require("../middleware/auth");

router.get("/", (req, res) => {
  const warehouses = query("SELECT * FROM warehouses WHERE is_active = 1 ORDER BY name");
  res.json({ success: true, data: warehouses });
});

router.get("/all", verifyToken, (req, res) => {
  const warehouses = query("SELECT * FROM warehouses ORDER BY name");
  res.json({ success: true, data: warehouses });
});

router.post("/", verifyToken, (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Nombre requerido" });
    const id = generateId();
    run("INSERT INTO warehouses (id, name, address, phone) VALUES (?, ?, ?, ?)", [id, name, address || "", phone || ""]);
    res.status(201).json({ success: true, data: { id, name, address, phone }, message: "Almacén creado" });
  } catch (err) { res.status(500).json({ success: false, message: "Error al crear" }); }
});

router.put("/:id", verifyToken, (req, res) => {
  try {
    const wh = get("SELECT id FROM warehouses WHERE id = ?", [req.params.id]);
    if (!wh) return res.status(404).json({ success: false, message: "No encontrado" });
    const { name, address, phone, is_active } = req.body;
    run("UPDATE warehouses SET name = COALESCE(?, name), address = COALESCE(?, address), phone = COALESCE(?, phone), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?",
      [name || null, address || null, phone || null, is_active != null ? is_active : null, req.params.id]);
    res.json({ success: true, message: "Actualizado" });
  } catch (err) { res.status(500).json({ success: false, message: "Error" }); }
});

router.delete("/:id", verifyToken, (req, res) => {
  run("UPDATE warehouses SET is_active = 0, updated_at = datetime('now') WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Eliminado" });
});

module.exports = router;
