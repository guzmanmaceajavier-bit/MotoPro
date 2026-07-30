const { query, get, run } = require("../config/database");
const { generateId, slugify } = require("../utils/helpers");

const ServiceRepository = {
  findAll({ all, category } = {}) {
    let sql = "SELECT * FROM services";
    const params = [];
    const conditions = [];
    if (all !== "1") conditions.push("is_active = 1");
    if (category) { conditions.push("LOWER(category) = LOWER(?)"); params.push(category); }
    if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY sort_order";
    return query(sql, params).map(s => ({ ...s, features: JSON.parse(s.features || '[]') }));
  },

  findById(id) {
    const service = get("SELECT * FROM services WHERE id = ?", [id]);
    if (service) service.features = JSON.parse(service.features || '[]');
    return service;
  },

  create(data) {
    const id = generateId();
    const slug = slugify(data.title);
    run("INSERT INTO services (id, title, slug, description, features, icon, icon_type, price, duration, accent, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, data.title, slug, data.description || "", JSON.stringify(data.features || []),
       data.icon || "wrench", data.icon_type || "lucide", data.price || null,
       data.duration || null, data.accent || "#F59E0B", data.category || ""]);
    return id;
  },

  update(id, data) {
    run(`UPDATE services SET title = COALESCE(?, title), description = COALESCE(?, description),
      features = COALESCE(?, features), icon = COALESCE(?, icon), icon_type = COALESCE(?, icon_type),
      price = ?, duration = COALESCE(?, duration), accent = COALESCE(?, accent),
      category = COALESCE(?, category), is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order) WHERE id = ?`,
      [data.title || null, data.description || null,
       data.features ? JSON.stringify(data.features) : null,
       data.icon || null, data.icon_type || null,
       data.price !== undefined ? data.price : null,
       data.duration || null, data.accent || null,
       data.category || null,
       data.is_active != null ? data.is_active : null,
       data.sort_order != null ? data.sort_order : null, id]);
  },

  delete(id) {
    run("DELETE FROM services WHERE id = ?", [id]);
  },

  count() {
    return get("SELECT COUNT(*) as total FROM services")?.total || 0;
  }
};

module.exports = ServiceRepository;
