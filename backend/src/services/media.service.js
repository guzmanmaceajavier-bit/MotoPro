const { query, get, run } = require('../config/database');
const { generateId } = require('../utils/helpers');
const { uploadToCloudinary, destroyImage } = require('../utils/cloudinary');

exports.list = ({ folder, search, tags, page = 1, limit = 24, trashed = false }) => {
  let sql = 'SELECT * FROM media WHERE is_trashed = ?';
  const params = [trashed ? 1 : 0];
  if (folder && folder !== '/') { sql += ' AND folder = ?'; params.push(folder); }
  if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
  sql += ' ORDER BY created_at DESC';
  const items = query(sql, params);
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  return {
    data: items.slice(offset, offset + limit).map(item => ({ ...item, tags: JSON.parse(item.tags || '[]') })),
    pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages },
  };
};

exports.getById = (id) => {
  const item = get('SELECT * FROM media WHERE id = ?', [id]);
  if (item) item.tags = JSON.parse(item.tags || '[]');
  return item;
};

exports.getUsages = (mediaId) => {
  return query('SELECT * FROM media_usages WHERE media_id = ?', [mediaId]);
};

exports.create = async ({ name, url, cloudinaryId, size, width, height, mimeType, folder, tags, alt }) => {
  const id = generateId();
  run(`INSERT INTO media (id, name, url, cloudinary_id, size, width, height, mime_type, folder, tags, alt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, url, cloudinaryId || null, size || 0, width || 0, height || 0,
     mimeType || 'image/jpeg', folder || '/', JSON.stringify(tags || []), alt || '']);
  return this.getById(id);
};

exports.update = (id, { name, folder, tags, alt }) => {
  const existing = get('SELECT id FROM media WHERE id = ?', [id]);
  if (!existing) return null;
  run(`UPDATE media SET name = COALESCE(?, name), folder = COALESCE(?, folder),
    tags = COALESCE(?, tags), alt = COALESCE(?, alt), updated_at = datetime('now') WHERE id = ?`,
    [name || null, folder || null, tags ? JSON.stringify(tags) : null, alt || null, id]);
  return this.getById(id);
};

exports.trash = (id) => {
  run('UPDATE media SET is_trashed = 1 WHERE id = ?', [id]);
};

exports.restore = (id) => {
  run('UPDATE media SET is_trashed = 0 WHERE id = ?', [id]);
};

exports.deletePermanent = async (id) => {
  const item = get('SELECT * FROM media WHERE id = ?', [id]);
  if (!item) return false;
  if (item.cloudinary_id) await destroyImage(item.url).catch(() => {});
  run('DELETE FROM media_usages WHERE media_id = ?', [id]);
  run('DELETE FROM media WHERE id = ?', [id]);
  return true;
};

exports.registerUsage = (mediaId, entityType, entityId, fieldName) => {
  const existing = get('SELECT id FROM media_usages WHERE media_id = ? AND entity_type = ? AND entity_id = ? AND field_name = ?',
    [mediaId, entityType, entityId, fieldName]);
  if (existing) return;
  const id = generateId();
  run('INSERT INTO media_usages (id, media_id, entity_type, entity_id, field_name) VALUES (?, ?, ?, ?, ?)',
    [id, mediaId, entityType, entityId, fieldName]);
  run('UPDATE media SET usage_count = (SELECT COUNT(*) FROM media_usages WHERE media_id = ?), updated_at = datetime(\'now\') WHERE id = ?',
    [mediaId, mediaId]);
};

exports.unregisterUsage = (entityType, entityId, fieldName) => {
  const usage = get('SELECT id, media_id FROM media_usages WHERE entity_type = ? AND entity_id = ? AND field_name = ?',
    [entityType, entityId, fieldName]);
  if (!usage) return;
  run('DELETE FROM media_usages WHERE id = ?', [usage.id]);
  run('UPDATE media SET usage_count = (SELECT COUNT(*) FROM media_usages WHERE media_id = ?), updated_at = datetime(\'now\') WHERE id = ?',
    [usage.media_id, usage.media_id]);
};

exports.getFolders = () => {
  const rows = query('SELECT DISTINCT folder FROM media WHERE is_trashed = 0 ORDER BY folder');
  return rows.map(r => r.folder);
};

exports.getTags = () => {
  const rows = query('SELECT tags FROM media WHERE is_trashed = 0');
  const tagSet = new Set();
  rows.forEach(r => {
    try { JSON.parse(r.tags || '[]').forEach(t => tagSet.add(t)); } catch (e) {}
  });
  return [...tagSet].sort();
};
