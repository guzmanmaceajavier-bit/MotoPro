const { query, get, run } = require('../config/database');
const { generateId } = require('../utils/helpers');

exports.getHomepageSections = () => {
  return query('SELECT * FROM homepage_sections ORDER BY sort_order ASC');
};

exports.getHomepageSection = (sectionKey) => {
  return get('SELECT * FROM homepage_sections WHERE section_key = ?', [sectionKey]);
};

exports.upsertHomepageSection = (sectionKey, data) => {
  const existing = get('SELECT id FROM homepage_sections WHERE section_key = ?', [sectionKey]);
  if (existing) {
    run(`UPDATE homepage_sections SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle),
      description = COALESCE(?, description), image = COALESCE(?, image),
      button_text = COALESCE(?, button_text), button_link = COALESCE(?, button_link),
      sort_order = COALESCE(?, sort_order), is_visible = COALESCE(?, is_visible),
      settings_json = COALESCE(?, settings_json), updated_at = datetime('now')
      WHERE section_key = ?`,
      [data.title, data.subtitle, data.description, data.image,
       data.button_text, data.button_link, data.sort_order, data.is_visible,
       data.settings_json, sectionKey]);
    return this.getHomepageSection(sectionKey);
  }
  const id = generateId();
  run(`INSERT INTO homepage_sections (id, section_key, title, subtitle, description, image,
    button_text, button_link, sort_order, is_visible, settings_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, sectionKey, data.title || '', data.subtitle || '', data.description || '',
     data.image || '', data.button_text || '', data.button_link || '',
     data.sort_order || 0, data.is_visible != null ? data.is_visible : 1,
     data.settings_json || '{}']);
  return this.getHomepageSection(sectionKey);
};

exports.updateHomepageOrder = (items) => {
  items.forEach((item, index) => {
    run('UPDATE homepage_sections SET sort_order = ?, updated_at = datetime(\'now\') WHERE id = ?', [index, item.id]);
  });
};

exports.getNavbarItems = () => {
  return query('SELECT * FROM navbar_config ORDER BY sort_order ASC');
};

exports.upsertNavbarItem = (data) => {
  if (data.id) {
    run(`UPDATE navbar_config SET label = COALESCE(?, label), link = COALESCE(?, link),
      icon = COALESCE(?, icon), sort_order = COALESCE(?, sort_order),
      is_visible = COALESCE(?, is_visible), is_mega_menu = COALESCE(?, is_mega_menu),
      parent_id = ? WHERE id = ?`,
      [data.label, data.link, data.icon, data.sort_order,
       data.is_visible, data.is_mega_menu, data.parent_id || null, data.id]);
    return get('SELECT * FROM navbar_config WHERE id = ?', [data.id]);
  }
  const id = generateId();
  run(`INSERT INTO navbar_config (id, label, link, icon, sort_order, is_visible, is_mega_menu, parent_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.label, data.link, data.icon || '', data.sort_order || 0,
     data.is_visible != null ? data.is_visible : 1, data.is_mega_menu || 0, data.parent_id || null]);
  return get('SELECT * FROM navbar_config WHERE id = ?', [id]);
};

exports.deleteNavbarItem = (id) => {
  run('DELETE FROM navbar_config WHERE id = ?', [id]);
};

exports.getFooterColumns = () => {
  return query('SELECT * FROM footer_config ORDER BY column_number ASC, sort_order ASC');
};

exports.upsertFooterColumn = (data) => {
  if (data.id) {
    run(`UPDATE footer_config SET column_number = COALESCE(?, column_number),
      section_title = COALESCE(?, section_title), items_json = COALESCE(?, items_json),
      sort_order = COALESCE(?, sort_order) WHERE id = ?`,
      [data.column_number, data.section_title, data.items_json, data.sort_order, data.id]);
    return get('SELECT * FROM footer_config WHERE id = ?', [data.id]);
  }
  const id = generateId();
  run(`INSERT INTO footer_config (id, column_number, section_title, items_json, sort_order)
    VALUES (?, ?, ?, ?, ?)`,
    [id, data.column_number || 1, data.section_title || '', data.items_json || '[]', data.sort_order || 0]);
  return get('SELECT * FROM footer_config WHERE id = ?', [id]);
};

exports.deleteFooterColumn = (id) => {
  run('DELETE FROM footer_config WHERE id = ?', [id]);
};

exports.getSeoConfig = (page) => {
  return get('SELECT * FROM seo_config WHERE page = ?', [page]);
};

exports.getAllSeoConfigs = () => {
  return query('SELECT * FROM seo_config ORDER BY page ASC');
};

exports.upsertSeoConfig = (page, data) => {
  const existing = get('SELECT id FROM seo_config WHERE page = ?', [page]);
  if (existing) {
    run(`UPDATE seo_config SET meta_title = COALESCE(?, meta_title),
      meta_description = COALESCE(?, meta_description), keywords = COALESCE(?, keywords),
      og_image = COALESCE(?, og_image), og_title = COALESCE(?, og_title),
      og_description = COALESCE(?, og_description), canonical_url = COALESCE(?, canonical_url),
      robots = COALESCE(?, robots), schema_json = COALESCE(?, schema_json),
      updated_at = datetime('now') WHERE page = ?`,
      [data.meta_title, data.meta_description, data.keywords, data.og_image,
       data.og_title, data.og_description, data.canonical_url, data.robots,
       data.schema_json, page]);
    return this.getSeoConfig(page);
  }
  const id = generateId();
  run(`INSERT INTO seo_config (id, page, meta_title, meta_description, keywords, og_image,
    og_title, og_description, canonical_url, robots, schema_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, page, data.meta_title || '', data.meta_description || '', data.keywords || '',
     data.og_image || '', data.og_title || '', data.og_description || '',
     data.canonical_url || '', data.robots || 'index, follow', data.schema_json || '{}']);
  return this.getSeoConfig(page);
};

exports.seedHomepageSections = () => {
  const existing = query('SELECT COUNT(*) as count FROM homepage_sections');
  if (existing[0]?.count > 0) return;
  const sections = [
    { key: 'hero', title: 'Cuidamos tu moto<br/>como si fuera nuestra', subtitle: 'Servicio especializado', desc: 'Especialistas en mantenimiento, reparación y venta de repuestos originales para todas las marcas. Más de 10 años cuidando tu moto.', btn: 'Agendar Servicio', link: '/solicitar-servicio' },
    { key: 'brand_selector', title: 'Selecciona tu marca', subtitle: 'Encuentra repuestos y servicios', desc: '' },
    { key: 'brands', title: 'Marcas que trabajamos', subtitle: 'Las mejores marcas', desc: '' },
    { key: 'categories', title: 'Categorías', subtitle: 'Navega por categorías', desc: '' },
    { key: 'why_us', title: '¿Por qué MotoPro?', subtitle: 'Nuestros valores', desc: 'Calidad, experiencia y pasión por las motos.' },
    { key: 'services', title: 'Nuestros Servicios', subtitle: 'Soluciones completas', desc: '' },
    { key: 'promotions', title: 'Promociones', subtitle: 'No te las pierdas', desc: '' },
    { key: 'featured_products', title: 'Productos Destacados', subtitle: 'Lo más vendido', desc: '' },
    { key: 'values', title: 'Nuestros Valores', subtitle: 'Lo que nos define', desc: '' },
    { key: 'before_after', title: 'Antes y Después', subtitle: 'Resultados reales', desc: '' },
    { key: 'stats', title: 'MotoPro en números', subtitle: 'Nuestra trayectoria', desc: '' },
    { key: 'gallery', title: 'Galería', subtitle: 'Nuestros trabajos', desc: '' },
    { key: 'team', title: 'Nuestro Equipo', subtitle: 'Expertos a tu servicio', desc: '' },
    { key: 'testimonials', title: 'Lo que dicen nuestros clientes', subtitle: 'Testimonios', desc: '' },
    { key: 'blog', title: 'Últimas del Blog', subtitle: 'Consejos y novedades', desc: '' },
    { key: 'faq', title: 'Preguntas Frecuentes', subtitle: 'Resolvemos tus dudas', desc: '' },
    { key: 'contact', title: 'Contáctanos', subtitle: 'Estamos para ayudarte', desc: '' },
  ];
  sections.forEach((s, i) => {
    const id = generateId();
    run(`INSERT INTO homepage_sections (id, section_key, title, subtitle, description, button_text, button_link, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, s.key, s.title, s.subtitle, s.desc, s.btn || '', s.link || '', i]);
  });
  console.log('  ✓ Homepage sections seeded');
};
