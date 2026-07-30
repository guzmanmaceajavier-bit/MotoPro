const { query, get, run } = require("../config/database");
const { generateId } = require("../utils/helpers");

const BrandRepository = {
  findAll(showAll = false) {
    const where = showAll ? "" : "WHERE b.is_active = 1";
    const brands = query(`
      SELECT b.*, COALESCE(pc.cnt, 0) as vehicle_count
      FROM brands b
      LEFT JOIN (SELECT brand_id, COUNT(*) as cnt FROM products GROUP BY brand_id) pc ON pc.brand_id = b.id
      ${where}
      ORDER BY b.sort_order
    `);
    return brands.map(b => ({ ...b, models: JSON.parse(b.models || '[]') }));
  },

  findById(id) {
    const brand = get("SELECT * FROM brands WHERE id = ?", [id]);
    if (brand) brand.models = JSON.parse(brand.models || '[]');
    return brand;
  },

  create(data) {
    const id = generateId();
    run("INSERT INTO brands (id, name, image, alt_image, accent, is_active, is_visible_store, models, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, data.name, data.image || null, data.alt_image || null, data.accent || null,
       data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
       data.is_visible_store !== undefined ? (data.is_visible_store ? 1 : 0) : 1,
       JSON.stringify(data.models || []), data.sort_order || 0]);
    return id;
  },

  update(id, data) {
    run(`UPDATE brands SET
      name = COALESCE(?, name),
      image = COALESCE(?, image),
      alt_image = COALESCE(?, alt_image),
      accent = COALESCE(?, accent),
      is_active = COALESCE(?, is_active),
      is_visible_store = COALESCE(?, is_visible_store),
      models = COALESCE(?, models),
      sort_order = COALESCE(?, sort_order)
      WHERE id = ?`,
      [data.name || null, data.image || null, data.alt_image || null, data.accent || null,
       data.is_active !== undefined ? (data.is_active ? 1 : 0) : null,
       data.is_visible_store !== undefined ? (data.is_visible_store ? 1 : 0) : null,
       data.models ? JSON.stringify(data.models) : null,
       data.sort_order != null ? data.sort_order : null, id]);
  },

  delete(id) {
    run("DELETE FROM brands WHERE id = ?", [id]);
  },

  count() {
    return get("SELECT COUNT(*) as total FROM brands")?.total || 0;
  }
};

module.exports = BrandRepository;
