const ProductRepository = require("../repositories/products.repository");
const { destroyImage } = require("../utils/cloudinary");
const { success, error, paginate } = require("../utils/helpers");
const { run } = require("../config/database");

exports.list = (req, res) => {
  const { category, brand, search, page = 1, limit = 12, sort, all, vehicle_brand, displacement, stock_status } = req.query;
  const items = ProductRepository.findAll({ category, brand, search, sort, all, vehicle_brand, displacement, stock_status });
  if (all === "1") { success(res, items); }
  else { success(res, paginate(items, parseInt(page), parseInt(limit))); }
};

exports.getById = (req, res) => {
  const product = ProductRepository.findById(req.params.id);
  if (!product) return error(res, "Producto no encontrado", 404);
  product.images = ProductRepository.findImages(req.params.id);
  product.recent_movements = ProductRepository.findMovements(req.params.id);
  success(res, product);
};

exports.featured = (req, res) => {
  success(res, ProductRepository.findFeatured());
};

exports.getBySlug = (req, res) => {
  const product = ProductRepository.findBySlug(req.params.slug);
  if (!product) return error(res, "Producto no encontrado", 404);
  product.images = ProductRepository.findImages(product.id);
  success(res, product);
};

exports.create = (req, res) => {
  const { name, category_id, price, purchase_price } = req.body;
  if (!name || !category_id) return error(res, "Nombre y categoría son requeridos", 400);
  const pPrice = parseFloat(purchase_price) || 0;
  const sPrice = parseFloat(price) || 0;
  if (pPrice > 0 && sPrice > 0 && sPrice <= pPrice) return error(res, "El precio de venta debe ser mayor al precio de compra", 400);
  const id = ProductRepository.create(req.body);
  success(res, ProductRepository.findById(id), 201);
};

exports.update = (req, res) => {
  const product = ProductRepository.findById(req.params.id);
  if (!product) return error(res, "Producto no encontrado", 404);
  ProductRepository.update(req.params.id, req.body);
  success(res, ProductRepository.findById(req.params.id));
};

exports.remove = (req, res) => {
  const product = ProductRepository.findById(req.params.id);
  if (!product) return error(res, "Producto no encontrado", 404);
  if (product.image) destroyImage(product.image);
  ProductRepository.delete(req.params.id);
  success(res, { message: "Producto eliminado" });
};

exports.count = (req, res) => {
  success(res, { total: ProductRepository.count(), active: ProductRepository.countActive() });
};

exports.getStockAlerts = (req, res) => {
  const products = ProductRepository.getStockAlerts();
  success(res, products);
};

exports.getPhysicalCounts = (req, res) => {
  const counts = ProductRepository.getPhysicalCounts();
  success(res, counts);
};

exports.adjustStock = (req, res) => {
  const { quantity, type, reason } = req.body;
  const product = ProductRepository.findById(req.params.id);
  if (!product) return error(res, "Producto no encontrado", 404);
  if (!quantity) return error(res, "Cantidad requerida", 400);
  const adjustment = type === "remove" ? -Math.abs(quantity) : Math.abs(quantity);
  const newStock = product.stock + adjustment;
  if (newStock < 0) return error(res, "Stock insuficiente", 400);
  ProductRepository.update(req.params.id, { stock: newStock });
  run("INSERT INTO inventory_movements (id, product_id, type, quantity, reason, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
    [require("../utils/helpers").generateId(), req.params.id, type || "adjust", adjustment, reason || "Ajuste manual"]);
  success(res, { new_stock: newStock }, "Stock ajustado");
};

exports.startPhysicalCount = (req, res) => {
  const id = require("../utils/helpers").generateId();
  run("INSERT INTO physical_inventory (id, created_at) VALUES (?, datetime('now'))", [id]);
  success(res, { id }, "Conteo físico iniciado");
};

exports.submitPhysicalCount = (req, res) => {
  const { count_id, items } = req.body;
  if (!count_id || !items) return error(res, "Datos incompletos", 400);
  for (const item of items) {
    run("UPDATE products SET stock = ? WHERE id = ?", [item.actual_stock, item.product_id]);
    run("INSERT INTO inventory_movements (id, product_id, type, quantity, reason, created_at) VALUES (?, ?, 'physical_count', ?, ?, datetime('now'))",
      [require("../utils/helpers").generateId(), item.product_id, item.actual_stock - (item.expected_stock || 0), "Conteo físico"]);
  }
  success(res, null, "Conteo físico completado");
};

exports.approvePhysicalCount = (req, res) => {
  run("UPDATE physical_inventory SET approved_at = datetime('now') WHERE id = ?", [req.params.countId]);
  success(res, null, "Conteo físico aprobado");
};

exports.search = (req, res) => {
  success(res, ProductRepository.searchByName(req.query.q || ""));
};
