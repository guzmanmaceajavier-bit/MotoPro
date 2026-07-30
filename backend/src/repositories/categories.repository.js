const { query, get, run } = require("../config/database");
const { generateId, slugify } = require("../utils/helpers");

const CategoryRepository = {
  findAll() {
    const categories = query(`SELECT c.*,
      (SELECT json_group_array(json_object('id', s.id, 'name', s.name, 'count', s.count, 'sort_order', s.sort_order))
        FROM subcategories s WHERE s.category_id = c.id ORDER BY s.sort_order) as subcategories
      FROM categories c ORDER BY c.sort_order`);
    return categories.map(c => ({ ...c, subcategories: JSON.parse(c.subcategories || '[]') }));
  },

  findById(id) {
    const cat = get(`SELECT c.*,
      (SELECT json_group_array(json_object('id', s.id, 'name', s.name, 'count', s.count, 'sort_order', s.sort_order))
        FROM subcategories s WHERE s.category_id = c.id ORDER BY s.sort_order) as subcategories
      FROM categories c WHERE c.id = ?`, [id]);
    if (cat) cat.subcategories = JSON.parse(cat.subcategories || '[]');
    return cat;
  },

  findBySlug(slug) {
    const cat = get(`SELECT c.*,
      (SELECT json_group_array(json_object('id', s.id, 'name', s.name, 'count', s.count, 'sort_order', s.sort_order))
        FROM subcategories s WHERE s.category_id = c.id ORDER BY s.sort_order) as subcategories
      FROM categories c WHERE c.slug = ?`, [slug]);
    if (cat) cat.subcategories = JSON.parse(cat.subcategories || '[]');
    return cat;
  },

  create(data) {
    const id = generateId();
    const slug = slugify(data.name);
    run("INSERT INTO categories (id, name, slug, image) VALUES (?, ?, ?, ?)", [id, data.name, slug, data.image || null]);
    return id;
  },

  update(id, data) {
    run("UPDATE categories SET name = COALESCE(?, name), slug = COALESCE(?, slug), image = COALESCE(?, image) WHERE id = ?",
      [data.name || null, data.name ? slugify(data.name) : null, data.image || null, id]);
  },

  delete(id) {
    run("DELETE FROM categories WHERE id = ?", [id]);
  },

  count() {
    return get("SELECT COUNT(*) as total FROM categories")?.total || 0;
  },

  findSubcategories(categoryId) {
    return query("SELECT * FROM subcategories WHERE category_id = ? ORDER BY sort_order", [categoryId]);
  },

  createSubcategory(categoryId, data) {
    const id = generateId();
    run("INSERT INTO subcategories (id, category_id, name, count, sort_order) VALUES (?, ?, ?, ?, ?)",
      [id, categoryId, data.name, data.count || 0, data.sort_order || 0]);
    return id;
  },

  updateSubcategory(id, data) {
    run("UPDATE subcategories SET name = COALESCE(?, name), count = COALESCE(?, count), sort_order = COALESCE(?, sort_order) WHERE id = ?",
      [data.name || null, data.count ?? null, data.sort_order ?? null, id]);
  },

  deleteSubcategory(id) {
    run("DELETE FROM subcategories WHERE id = ?", [id]);
  }
};

module.exports = CategoryRepository;
