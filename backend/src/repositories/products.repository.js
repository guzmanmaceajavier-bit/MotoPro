const { query, get, run } = require("../config/database");
const { generateId, slugify } = require("../utils/helpers");

const ProductRepository = {
  findAll({ category, brand, search, sort, all, vehicle_brand, displacement, stock_status }) {
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
    return query(sql, params);
  },

  findById(id) {
    return get(`SELECT p.*, c.name as category_name, c.slug as category_slug,
      s.name as subcategory_name, b.name as brand_name, sup.name as supplier_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN suppliers sup ON p.supplier_id = sup.id WHERE p.id = ?`, [id]);
  },

  findBySlug(slug) {
    return get(`SELECT p.*, c.name as category_name, c.slug as category_slug,
      s.name as subcategory_name, b.name as brand_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN brands b ON p.brand_id = b.id WHERE p.slug = ?`, [slug]);
  },

  findFeatured() {
    return query(`SELECT p.*, c.name as category_name, c.slug as category_slug, b.name as brand_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_featured = 1 AND p.is_active = 1 ORDER BY p.created_at DESC LIMIT 8`);
  },

  findImages(productId) {
    return query("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC", [productId]);
  },

  findMovements(productId) {
    return query("SELECT * FROM inventory_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT 10", [productId]);
  },

  create(data) {
    const id = generateId();
    const slug = slugify(data.name);
    run(`INSERT INTO products (id, name, slug, sku, category_id, subcategory_id, brand_id,
      purchase_price, price, stock, description, image, is_active, min_stock, max_stock,
      reorder_point, location, vehicle_brand, vehicle_model, vehicle_year_start, vehicle_year_end,
      displacement, compatible_with, weight, supplier_id, barcode, warranty, quality_label,
      compatibility_text, compare_price, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, data.name, slug, data.sku || null, data.category_id, data.subcategory_id || null,
       data.brand_id || null, data.purchase_price || 0, data.price || 0, data.stock || 0,
       data.description || null, data.image || null, data.is_active !== false ? 1 : 0,
       data.min_stock || 0, data.max_stock || 0, data.reorder_point || 0, data.location || null,
       data.vehicle_brand || null, data.vehicle_model || null, data.vehicle_year_start || null,
       data.vehicle_year_end || null, data.displacement || null, data.compatible_with || null,
       data.weight || null, data.supplier_id || null, data.barcode || null,
       data.warranty || null, data.quality_label || null, data.compatibility_text || null,
       data.compare_price || null]);
    return id;
  },

  update(id, data) {
    const fields = [];
    const params = [];
    const allowed = ['name', 'sku', 'category_id', 'subcategory_id', 'brand_id', 'purchase_price',
      'price', 'stock', 'description', 'image', 'is_active', 'min_stock', 'max_stock',
      'reorder_point', 'location', 'vehicle_brand', 'vehicle_model', 'vehicle_year_start',
      'vehicle_year_end', 'displacement', 'compatible_with', 'weight', 'supplier_id', 'barcode',
      'warranty', 'quality_label', 'compatibility_text', 'compare_price'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) return false;
    params.push(id);
    run(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
    return true;
  },

  delete(id) {
    run("DELETE FROM products WHERE id = ?", [id]);
  },

  count() {
    return get("SELECT COUNT(*) as total FROM products")?.total || 0;
  },

  countActive() {
    return get("SELECT COUNT(*) as total FROM products WHERE is_active = 1")?.total || 0;
  },

  searchByName(search) {
    return query("SELECT * FROM products WHERE name LIKE ? OR sku LIKE ? LIMIT 10", [`%${search}%`, `%${search}%`]);
  },

  getStockAlerts() {
    return query(`SELECT p.*, c.name as category_name, b.name as brand_name,
      CASE WHEN p.stock <= 0 THEN 'out_of_stock'
           WHEN p.stock <= p.min_stock THEN 'low_stock'
           WHEN p.max_stock > 0 AND p.stock > p.max_stock THEN 'over_stock'
           ELSE 'ok' END as alert_type
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = 1 AND (p.stock <= p.min_stock OR (p.max_stock > 0 AND p.stock > p.max_stock))
      ORDER BY p.stock ASC LIMIT 20`);
  },

  getPhysicalCounts() {
    return query(`SELECT * FROM physical_inventory ORDER BY created_at DESC LIMIT 10`);
  }
};

module.exports = ProductRepository;
