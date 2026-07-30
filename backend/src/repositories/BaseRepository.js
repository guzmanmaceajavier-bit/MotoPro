const { query, get, run } = require("../config/database");
const { generateId } = require("../utils/helpers");

function BaseRepository(table, options = {}) {
  const { sortField = "sort_order", activeField = "is_active", parseFields = [] } = options;

  const parse = (item) => {
    if (!item || !parseFields.length) return item;
    const parsed = { ...item };
    parseFields.forEach(f => { if (typeof parsed[f] === "string") try { parsed[f] = JSON.parse(parsed[f]); } catch {} });
    return parsed;
  };

  return {
    findAll(showAll = false) {
      let sql = `SELECT * FROM ${table}`;
      const conditions = [];
      if (!showAll && activeField) conditions.push(`${activeField} = 1`);
      if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
      sql += ` ORDER BY ${sortField}`;
      return query(sql).map(parse);
    },

    findById(id) {
      return parse(get(`SELECT * FROM ${table} WHERE id = ?`, [id]));
    },

    create(data) {
      const id = generateId();
      const cols = ["id"];
      const vals = [id];
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) { cols.push(k); vals.push(v); }
      }
      run(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`, vals);
      return id;
    },

    update(id, data) {
      const sets = Object.entries(data).filter(([, v]) => v !== undefined).map(([k]) => `${k} = ?`);
      if (!sets.length) return;
      const vals = Object.entries(data).filter(([, v]) => v !== undefined).map(([, v]) => v);
      run(`UPDATE ${table} SET ${sets.join(", ")} WHERE id = ?`, [...vals, id]);
    },

    remove(id) {
      run(`DELETE FROM ${table} WHERE id = ?`, [id]);
    },

    count() {
      return get(`SELECT COUNT(*) as total FROM ${table}`)?.total || 0;
    },
  };
}

module.exports = BaseRepository;
