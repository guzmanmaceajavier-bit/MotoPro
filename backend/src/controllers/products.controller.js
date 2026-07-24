const { query, get, run } = require("../config/database");
const { generateId, slugify, success, error, paginate } = require("../utils/helpers");
const { destroyImage } = require("../utils/cloudinary");

exports.list = (req, res) => {
  const { category, brand, search, page = 1, limit = 12, sort, all, vehicle_brand, displacement, stock_status } = req.query;
  let sql = `SELECT p.*, c.name as category_name, s.name as subcategory_name, b.name as brand_name,
    sup.name as supplier_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN suppliers sup ON p.supplier_id = sup.id`;
  const conditions = [];
  const params = [];
  if (all !== "1") conditions.push("p.is_active = 1");
  if (category) { conditions.push("c.slug = ?"); params.push(category); }
  if (brand) { conditions.push("b.id = ?"); params.push(brand); }
  if (search) { conditions.push("(p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)"); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (vehicle_brand) { conditions.push("p.vehicle_brand LIKE ?"); params.push(`%${vehicle_brand}%`); }
  if (displacement) { conditions.push("p.displacement = ?"); params.push(displacement); }
  if (stock_status === "low") { conditions.push("p.stock > 0 AND p.stock <= p.min_stock"); }
  else if (stock_status === "out") { conditions.push("p.stock <= 0"); }
  else if (stock_status === "over") { conditions.push("p.max_stock > 0 AND p.stock > p.max_stock"); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  if (sort === "price_asc") sql += " ORDER BY p.price ASC";
  else if (sort === "price_desc") sql += " ORDER BY p.price DESC";
  else if (sort === "name") sql += " ORDER BY p.name ASC";
  else if (sort === "stock_low") sql += " ORDER BY p.stock ASC";
  else sql += " ORDER BY p.created_at DESC";
  const items = query(sql, params);
  if (all === "1") { success(res, items); }
  else { success(res, paginate(items, parseInt(page), parseInt(limit))); }
};

exports.getById = (req, res) => {
  const product = get(`SELECT p.*, c.name as category_name, c.slug as category_slug,
    s.name as subcategory_name, b.name as brand_name, sup.name as supplier_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN suppliers sup ON p.supplier_id = sup.id WHERE p.id = ?`, [req.params.id]);
  if (!product) return error(res, "Producto no encontrado", 404);
  product.images = query("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC", [req.params.id]);
  product.recent_movements = query("SELECT * FROM inventory_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT 10", [req.params.id]);
  success(res, product);
};

exports.featured = (req, res) => {
  const items = query(`SELECT p.*, c.name as category_name, c.slug as category_slug, b.name as brand_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_featured = 1 AND p.is_active = 1 ORDER BY p.created_at DESC LIMIT 8`);
  success(res, items);
};

exports.getBySlug = (req, res) => {
  const product = get(`SELECT p.*, c.name as category_name, c.slug as category_slug,
    s.name as subcategory_name, b.name as brand_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN brands b ON p.brand_id = b.id WHERE p.slug = ?`, [req.params.slug]);
  if (!product) return error(res, "Producto no encontrado", 404);
  product.images = query("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC", [product.id]);
  success(res, product);
};

exports.create = (req, res) => {
  const {
    name, sku, category_id, subcategory_id, brand_id, purchase_price, price, stock,
    description, image, is_active, min_stock, max_stock, reorder_point, location,
    vehicle_brand, vehicle_model, vehicle_year_start, vehicle_year_end, displacement,
    compatible_with, weight, supplier_id, barcode,
    warranty, quality_label, compatibility_text, compare_price
  } = req.body;
  if (!name || !category_id) return error(res, "Nombre y categoría son requeridos", 400);
  const pPrice = parseFloat(purchase_price) || 0;
  const sPrice = parseFloat(price) || 0;
  if (pPrice > 0 && sPrice > 0 && sPrice <= pPrice) return error(res, "El precio de venta debe ser mayor al precio de compra", 400);
  const id = generateId();
  const slug = slugify(name);
  run(`INSERT INTO products (id, name, slug, sku, category_id, subcategory_id, brand_id,
    purchase_price, price, stock, description, image, is_active,
    min_stock, max_stock, reorder_point, location,
    vehicle_brand, vehicle_model, vehicle_year_start, vehicle_year_end, displacement,
    compatible_with, weight, supplier_id, barcode,
    warranty, quality_label, compatibility_text, compare_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, slug, sku || "", category_id, subcategory_id || null, brand_id || null,
     pPrice, sPrice, parseInt(stock) || 0, description || "", image || null, is_active != null ? is_active : 1,
     parseInt(min_stock) || 5, parseInt(max_stock) || 0, parseInt(reorder_point) || 0, location || "",
     vehicle_brand || "", vehicle_model || "", vehicle_year_start || "", vehicle_year_end || "",
     displacement || "", compatible_with || "universal", parseFloat(weight) || 0,
     supplier_id || null, barcode || "",
     warranty || "", quality_label || "", compatibility_text || "", parseFloat(compare_price) || 0]);
  success(res, { id }, "Producto creado", 201);
};

exports.update = (req, res) => {
  const {
    name, sku, category_id, subcategory_id, brand_id, purchase_price, price, stock,
    description, image, is_active, min_stock, max_stock, reorder_point, location,
    vehicle_brand, vehicle_model, vehicle_year_start, vehicle_year_end, displacement,
    compatible_with, weight, supplier_id, barcode,
    warranty, quality_label, compatibility_text, compare_price
  } = req.body;
  const id = req.params.id;
  const existing = get("SELECT id, image, purchase_price, price FROM products WHERE id = ?", [id]);
  if (!existing) return error(res, "Producto no encontrado", 404);
  const pPrice = purchase_price != null ? parseFloat(purchase_price) : existing.purchase_price;
  const sPrice = price != null ? parseFloat(price) : existing.price;
  if (pPrice > 0 && sPrice > 0 && sPrice <= pPrice) return error(res, "El precio de venta debe ser mayor al precio de compra", 400);
  if (image && image !== existing.image) destroyImage(existing.image);
  run(`UPDATE products SET
    name = COALESCE(?, name), sku = COALESCE(?, sku),
    category_id = COALESCE(?, category_id), subcategory_id = ?,
    brand_id = ?, purchase_price = COALESCE(?, purchase_price), price = COALESCE(?, price),
    stock = COALESCE(?, stock), description = COALESCE(?, description), image = COALESCE(?, image),
    is_active = COALESCE(?, is_active),
    min_stock = COALESCE(?, min_stock), max_stock = COALESCE(?, max_stock),
    reorder_point = COALESCE(?, reorder_point), location = COALESCE(?, location),
    vehicle_brand = COALESCE(?, vehicle_brand), vehicle_model = COALESCE(?, vehicle_model),
    vehicle_year_start = COALESCE(?, vehicle_year_start), vehicle_year_end = COALESCE(?, vehicle_year_end),
    displacement = COALESCE(?, displacement), compatible_with = COALESCE(?, compatible_with),
    weight = COALESCE(?, weight), supplier_id = ?, barcode = COALESCE(?, barcode),
    warranty = COALESCE(?, warranty), quality_label = COALESCE(?, quality_label),
    compatibility_text = COALESCE(?, compatibility_text),
    compare_price = COALESCE(?, compare_price),
    updated_at = datetime('now') WHERE id = ?`,
    [name || null, sku != null ? sku : null, category_id || null, subcategory_id || null, brand_id || null,
     purchase_price != null ? purchase_price : null, price != null ? price : null, stock != null ? stock : null,
     description || null, image || null, is_active != null ? is_active : null,
     min_stock != null ? min_stock : null, max_stock != null ? max_stock : null,
     reorder_point != null ? reorder_point : null, location || null,
     vehicle_brand || null, vehicle_model || null, vehicle_year_start || null, vehicle_year_end || null,
     displacement || null, compatible_with || null, weight != null ? weight : null,
     supplier_id || null, barcode || null,
     warranty || null, quality_label || null, compatibility_text || null,
     compare_price != null ? compare_price : null, id]);
  success(res, null, "Producto actualizado");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id, image FROM products WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Producto no encontrado", 404);
  destroyImage(existing.image);
  run("DELETE FROM products WHERE id = ?", [req.params.id]);
  success(res, null, "Producto eliminado");
};

// Stock management endpoints
exports.adjustStock = (req, res) => {
  const { type, quantity, unit_cost, reason, adjustment_type } = req.body;
  const product = get("SELECT id, stock, name FROM products WHERE id = ?", [req.params.id]);
  if (!product) return error(res, "Producto no encontrado", 404);
  if (!quantity || quantity <= 0) return error(res, "Cantidad requerida mayor a 0", 400);

  const qty = parseInt(quantity);
  let newStock = product.stock;
  if (type === "in") newStock += qty;
  else if (type === "out") {
    if (product.stock < qty) return error(res, `Stock insuficiente. Disponible: ${product.stock}`, 400);
    newStock -= qty;
  }
  else if (type === "adjustment") {
    newStock = qty; // Set to exact count
  }
  else return error(res, "Tipo inválido: in, out, adjustment", 400);

  run("UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?", [newStock, req.params.id]);
  run(`INSERT INTO inventory_movements (id, product_id, type, quantity, reference, notes, unit_cost, performed_by, adjustment_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [generateId(), req.params.id, type, qty, `manual_${type}`, reason || "",
     parseFloat(unit_cost) || 0, req.user?.name || "system", adjustment_type || ""]);

  success(res, { new_stock: newStock }, `Stock actualizado: ${product.name}`);
};

exports.getStockAlerts = (req, res) => {
  const lowStock = query(`SELECT p.*, c.name as category_name, b.name as brand_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = 1 AND p.stock > 0 AND p.stock <= p.min_stock
    ORDER BY p.stock ASC`);
  const outOfStock = query(`SELECT p.*, c.name as category_name, b.name as brand_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = 1 AND p.stock <= 0`);
  const overStock = query(`SELECT p.*, c.name as category_name, b.name as brand_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = 1 AND p.max_stock > 0 AND p.stock > p.max_stock`);
  const needReorder = query(`SELECT p.*, c.name as category_name, b.name as brand_name, sup.name as supplier_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN suppliers sup ON p.supplier_id = sup.id
    WHERE p.is_active = 1 AND p.reorder_point > 0 AND p.stock <= p.reorder_point`);
  success(res, { lowStock, outOfStock, overStock, needReorder });
};

// Physical inventory
exports.startPhysicalCount = (req, res) => {
  const products = query("SELECT id, stock FROM products WHERE is_active = 1 ORDER BY name ASC");
  products.forEach(p => {
    const existing = get("SELECT id FROM physical_inventory WHERE product_id = ? AND status = 'pending'", [p.id]);
    if (!existing) {
      run(`INSERT INTO physical_inventory (id, product_id, system_stock, status)
        VALUES (?, ?, ?, 'pending')`, [generateId(), p.id, p.stock]);
    }
  });
  success(res, null, "Inventario físico iniciado");
};

exports.submitPhysicalCount = (req, res) => {
  const { product_id, counted_stock, notes } = req.body;
  if (!product_id || counted_stock == null) return error(res, "Producto y conteo requeridos", 400);
  const count = get("SELECT id, system_stock FROM physical_inventory WHERE product_id = ? AND status = 'pending'", [product_id]);
  if (!count) return error(res, "Conteo no encontrado", 404);
  const difference = parseInt(counted_stock) - count.system_stock;
  run(`UPDATE physical_inventory SET counted_stock = ?, difference = ?, status = 'counted',
    notes = ?, counted_by = ?, counted_at = datetime('now') WHERE id = ?`,
    [parseInt(counted_stock), difference, notes || "", req.user?.name || "system", count.id]);
  success(res, { difference }, "Conteo registrado");
};

exports.approvePhysicalCount = (req, res) => {
  const count = get("SELECT pi.*, p.stock FROM physical_inventory pi JOIN products p ON pi.product_id = p.id WHERE pi.id = ?", [req.params.countId]);
  if (!count) return error(res, "Conteo no encontrado", 404);
  if (count.status !== "counted") return error(res, "El conteo debe estar contado primero", 400);

  run("UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?", [count.counted_stock, count.product_id]);
  run("UPDATE physical_inventory SET status = 'approved' WHERE id = ?", [req.params.countId]);

  if (count.difference !== 0) {
    run(`INSERT INTO inventory_movements (id, product_id, type, quantity, reference, notes, adjustment_type, performed_by)
      VALUES (?, ?, 'adjustment', ?, 'physical_inventory', ?, 'physical_count', ?)`,
      [generateId(), count.product_id, count.counted_stock, `Ajuste por inventario físico: ${count.difference > 0 ? "+" : ""}${count.difference}`,
       req.user?.name || "system"]);
  }
  success(res, null, "Inventario físico aprobado");
};

exports.getPhysicalCounts = (req, res) => {
  const { status } = req.query;
  let sql = `SELECT pi.*, p.name as product_name, p.sku, p.stock as current_stock
    FROM physical_inventory pi JOIN products p ON pi.product_id = p.id`;
  const params = [];
  if (status) { sql += " WHERE pi.status = ?"; params.push(status); }
  sql += " ORDER BY pi.created_at DESC";
  success(res, query(sql, params));
};
