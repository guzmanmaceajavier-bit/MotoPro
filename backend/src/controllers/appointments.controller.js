const { query, get, run } = require("../config/database");
const { generateId, success, error } = require("../utils/helpers");

function getConfig(key, fallback) {
  return get("SELECT value FROM site_config WHERE key = ?", [key])?.value || fallback;
}

function getDurationMinutes(serviceType) {
  const durationsRaw = getConfig("service_durations", "{}");
  try {
    const durations = JSON.parse(durationsRaw);
    if (serviceType && durations[serviceType]) return parseInt(durations[serviceType]) || 60;
  } catch (e) { console.error("[backend]", e.message); }
  return parseInt(getConfig("appointment_interval_minutes", "60")) || 60;
}

function isHoliday(date, mechanic_id) {
  if (mechanic_id) {
    const h = get("SELECT id FROM holidays WHERE date = ? AND (applies_to = 'all' OR (applies_to = 'mechanic' AND mechanic_id = ?))", [date, mechanic_id]);
    if (h) return true;
  }
  return !!get("SELECT id FROM holidays WHERE date = ? AND applies_to = 'all'", [date]);
}

function getDailyCount(date) {
  return get("SELECT COUNT(*) as c FROM appointments WHERE appointment_date = ? AND status != 'cancelled'", [date])?.c || 0;
}

exports.list = (req, res) => {
  const { status, date, date_from, date_to, mechanic_id, customer_id, page, limit } = req.query;
  let sql = "SELECT a.*, tm.name as mechanic_name FROM appointments a LEFT JOIN team_members tm ON a.mechanic_id = tm.id";
  const conditions = [];
  const params = [];
  if (status) { conditions.push("a.status = ?"); params.push(status); }
  if (date) { conditions.push("a.appointment_date = ?"); params.push(date); }
  if (date_from) { conditions.push("a.appointment_date >= ?"); params.push(date_from); }
  if (date_to) { conditions.push("a.appointment_date <= ?"); params.push(date_to); }
  if (mechanic_id) { conditions.push("a.mechanic_id = ?"); params.push(mechanic_id); }
  if (customer_id) { conditions.push("a.customer_id = ?"); params.push(customer_id); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY a.appointment_date DESC, a.start_time ASC";
  if (page) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;
    const countRow = query(`SELECT COUNT(*) as total FROM appointments a${conditions.length ? " WHERE " + conditions.join(" AND ") : ""}`, params);
    const total = countRow[0]?.total || 0;
    const data = query(`${sql} LIMIT ? OFFSET ?`, [...params, limitNum, offset]);
    return success(res, { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  }
  const data = query(sql, params);
  success(res, data);
};

exports.getById = (req, res) => {
  const appointment = get("SELECT a.*, tm.name as mechanic_name FROM appointments a LEFT JOIN team_members tm ON a.mechanic_id = tm.id WHERE a.id = ?", [req.params.id]);
  if (!appointment) return error(res, "Cita no encontrada", 404);
  success(res, appointment);
};

exports.create = (req, res) => {
  const { customer_id, customer_name, customer_phone, customer_email, service_type, mechanic_id, appointment_date, start_time, notes } = req.body;
  if (!customer_name || !customer_phone || !appointment_date || !start_time) {
    return error(res, "Nombre, teléfono, fecha y hora son requeridos", 400);
  }

  // Check holiday
  if (isHoliday(appointment_date, mechanic_id)) {
    return error(res, "No se pueden agendar citas en días festivos o bloqueados", 400);
  }

  // Check daily capacity
  const dailyCapacity = parseInt(getConfig("daily_capacity", "10")) || 10;
  const currentCount = getDailyCount(appointment_date);
  if (currentCount >= dailyCapacity) {
    return error(res, `Capacidad diaria completa (${dailyCapacity} citas máximo)`, 400);
  }

  // Calculate duration from service type
  const duration = getDurationMinutes(service_type);
  const [h, m] = start_time.split(":").map(Number);
  const totalMinutes = h * 60 + m + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  const end_time = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

  // Check slot conflict for this mechanic
  if (mechanic_id) {
    const conflict = get(
      "SELECT id FROM appointments WHERE mechanic_id = ? AND appointment_date = ? AND status != 'cancelled' AND start_time < ? AND end_time > ?",
      [mechanic_id, appointment_date, end_time, start_time]
    );
    if (conflict) return error(res, "El mecánico ya tiene una cita en ese horario", 409);
  }

  const id = generateId();
  run(`INSERT INTO appointments (id, customer_id, customer_name, customer_phone, customer_email, service_type, mechanic_id, appointment_date, start_time, end_time, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, customer_id || null, customer_name, customer_phone, customer_email || "", service_type || "", mechanic_id || null, appointment_date, start_time, end_time, notes || ""]);

  // Create work order automatically
  try {
    const year = new Date().getFullYear();
    const count = get("SELECT COUNT(*) as c FROM work_orders")?.c || 0;
    const orderNumber = `MP-${year}-${String(count + 1).padStart(6, "0")}`;
    run(`INSERT INTO work_orders (id, order_number, customer_name, customer_phone, customer_email, service_type, description, status, appointment_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'received', ?)`,
      [generateId(), orderNumber, customer_name, customer_phone, customer_email || "", service_type || "", `Cita agendada para ${appointment_date} ${start_time}`, id]);
  } catch (e) { console.error("[backend]", e.message); }
 
  success(res, { id, end_time }, "Cita creada", 201);
};

exports.update = (req, res) => {
  const { customer_name, customer_phone, customer_email, service_type, mechanic_id, appointment_date, start_time, end_time, status, notes } = req.body;
  const existing = get("SELECT id FROM appointments WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Cita no encontrada", 404);

  // Check holiday if changing date
  if (appointment_date && isHoliday(appointment_date, mechanic_id)) {
    return error(res, "No se pueden agendar citas en días festivos o bloqueados", 400);
  }

  // Check capacity if changing date
  if (appointment_date) {
    const dailyCapacity = parseInt(getConfig("daily_capacity", "10")) || 10;
    const currentCount = getDailyCount(appointment_date);
    if (currentCount >= dailyCapacity) {
      return error(res, `Capacidad diaria completa (${dailyCapacity} citas máximo)`, 400);
    }
  }

  // Calculate end_time if start_time or service_type changed
  let finalEndTime = end_time;
  if (start_time && !end_time) {
    const duration = getDurationMinutes(service_type);
    const [h, m] = start_time.split(":").map(Number);
    const totalMinutes = h * 60 + m + duration;
    finalEndTime = `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
  }

  run(`UPDATE appointments SET
    customer_name = COALESCE(?, customer_name), customer_phone = COALESCE(?, customer_phone),
    customer_email = COALESCE(?, customer_email), service_type = COALESCE(?, service_type),
    mechanic_id = ?, appointment_date = COALESCE(?, appointment_date),
    start_time = COALESCE(?, start_time), end_time = COALESCE(?, end_time),
    status = COALESCE(?, status), notes = COALESCE(?, notes),
    updated_at = datetime('now') WHERE id = ?`,
    [customer_name || null, customer_phone || null, customer_email || null, service_type || null,
      mechanic_id !== undefined ? mechanic_id : null, appointment_date || null,
      start_time || null, finalEndTime || null, status || null, notes || null, req.params.id]);
  success(res, null, "Cita actualizada");
};

exports.remove = (req, res) => {
  const existing = get("SELECT id FROM appointments WHERE id = ?", [req.params.id]);
  if (!existing) return error(res, "Cita no encontrada", 404);
  run("DELETE FROM appointments WHERE id = ?", [req.params.id]);
  success(res, null, "Cita eliminada");
};

exports.getAvailableSlots = (req, res) => {
  const { date, mechanic_id, service_type } = req.query;
  if (!date) return error(res, "Fecha requerida", 400);

  // Check holiday
  if (isHoliday(date, mechanic_id)) {
    return success(res, { slots: [], isHoliday: true, message: "Día bloqueado o festivo" });
  }

  // Check capacity
  const dailyCapacity = parseInt(getConfig("daily_capacity", "10")) || 10;
  const currentCount = getDailyCount(date);
  if (currentCount >= dailyCapacity) {
    return success(res, { slots: [], isFull: true, message: "Capacidad diaria completa" });
  }

  const duration = getDurationMinutes(service_type);
  const breakStart = getConfig("break_start", "12:00");
  const breakEnd = getConfig("break_end", "13:00");
  const [bsH, bsM] = breakStart.split(":").map(Number);
  const [beH, beM] = breakEnd.split(":").map(Number);
  const breakStartMin = bsH * 60 + bsM;
  const breakEndMin = beH * 60 + beM;

  if (mechanic_id) {
    // Specific mechanic slots
    const dayOfWeek = new Date(date + "T00:00:00").getDay();
    const availability = get("SELECT * FROM mechanic_availability WHERE mechanic_id = ? AND day_of_week = ? AND is_available = 1", [mechanic_id, dayOfWeek]);
    if (!availability) return success(res, { slots: [], message: "Mecánico no disponible este día" });

    const existing = query("SELECT start_time, end_time FROM appointments WHERE mechanic_id = ? AND appointment_date = ? AND status != 'cancelled'", [mechanic_id, date]);
    const [startH, startM] = availability.start_time.split(":").map(Number);
    const [endH, endM] = availability.end_time.split(":").map(Number);
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;
    const slots = [];

    while (current + duration <= end) {
      const slotEnd = current + duration;
      const inBreak = (current < breakEndMin && slotEnd > breakStartMin);
      const isBooked = existing.some(e => {
        const [eSH, eSM] = e.start_time.split(":").map(Number);
        const [eEH, eEM] = e.end_time.split(":").map(Number);
        const eStart = eSH * 60 + eSM;
        const eEnd = eEH * 60 + eEM;
        return current < eEnd && slotEnd > eStart;
      });
      if (!inBreak && !isBooked) {
        slots.push({
          start: `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`,
          end: `${String(Math.floor(slotEnd / 60)).padStart(2, "0")}:${String(slotEnd % 60).padStart(2, "0")}`,
        });
      }
      current += parseInt(getConfig("appointment_interval_minutes", "30")) || 30;
    }
    return success(res, { slots, capacity: { total: dailyCapacity, used: currentCount, remaining: dailyCapacity - currentCount } });
  }

  // All mechanics available slots (aggregate)
  const mechanics = query("SELECT tm.id FROM team_members tm WHERE tm.role LIKE '%mec%' OR tm.role LIKE '%téc%' OR tm.specialty IS NOT NULL");
  const allSlots = {};
  mechanics.forEach(m => {
    allSlots[m.id] = [];
  });
  success(res, { slots: allSlots, mechanics: mechanics.length, capacity: { total: dailyCapacity, used: currentCount, remaining: dailyCapacity - currentCount } });
};

exports.getCalendar = (req, res) => {
  const { start_date, end_date, mechanic_id } = req.query;
  let sql = "SELECT a.*, tm.name as mechanic_name FROM appointments a LEFT JOIN team_members tm ON a.mechanic_id = tm.id";
  const conditions = [];
  const params = [];
  if (start_date) { conditions.push("a.appointment_date >= ?"); params.push(start_date); }
  if (end_date) { conditions.push("a.appointment_date <= ?"); params.push(end_date); }
  if (mechanic_id) { conditions.push("a.mechanic_id = ?"); params.push(mechanic_id); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY a.appointment_date ASC, a.start_time ASC";
  const rows = query(sql, params);

  // Get holidays for the range
  let holidaySql = "SELECT * FROM holidays";
  const hConditions = [];
  const hParams = [];
  if (start_date) { hConditions.push("date >= ?"); hParams.push(start_date); }
  if (end_date) { hConditions.push("date <= ?"); hParams.push(end_date); }
  if (hConditions.length) holidaySql += " WHERE " + hConditions.join(" AND ");
  const holidays = query(holidaySql, hParams);

  // Get capacity info per day
  const capacityPerDay = query(`
    SELECT appointment_date, COUNT(*) as count
    FROM appointments WHERE status != 'cancelled'
    ${start_date ? "AND appointment_date >= ?" : ""} ${end_date ? "AND appointment_date <= ?" : ""}
    GROUP BY appointment_date
  `, [start_date, end_date].filter(Boolean));

  const grouped = {};
  rows.forEach(row => {
    if (!grouped[row.appointment_date]) grouped[row.appointment_date] = [];
    grouped[row.appointment_date].push(row);
  });

  const holidayMap = {};
  holidays.forEach(h => {
    if (!holidayMap[h.date]) holidayMap[h.date] = [];
    holidayMap[h.date].push(h);
  });

  const capacityMap = {};
  capacityPerDay.forEach(c => { capacityMap[c.appointment_date] = c.count; });

  success(res, { appointments: grouped, holidays: holidayMap, capacity: capacityMap });
};

exports.myAppointments = (req, res) => {
  const data = query("SELECT a.*, tm.name as mechanic_name FROM appointments a LEFT JOIN team_members tm ON a.mechanic_id = tm.id WHERE a.customer_id = ? ORDER BY a.appointment_date DESC, a.start_time ASC", [req.user.id]);
  success(res, data);
};

exports.scheduleConfig = (req, res) => {
  const keys = ["working_hours_start", "working_hours_end", "break_start", "break_end", "appointment_interval_minutes", "daily_capacity", "service_durations"];
  const config = {};
  keys.forEach(k => {
    const row = get("SELECT value FROM site_config WHERE key = ?", [k]);
    config[k] = row?.value || "";
  });
  success(res, config);
};

exports.updateScheduleConfig = (req, res) => {
  const allowed = ["working_hours_start", "working_hours_end", "break_start", "break_end", "appointment_interval_minutes", "daily_capacity", "service_durations"];
  for (const [key, value] of Object.entries(req.body)) {
    if (allowed.includes(key)) {
      run("INSERT OR REPLACE INTO site_config (key, value, updated_at) VALUES (?, ?, datetime('now'))", [key, String(value)]);
    }
  }
  success(res, null, "Configuración de agenda actualizada");
};

exports.daySummary = (req, res) => {
  const { date } = req.query;
  if (!date) return error(res, "Fecha requerida", 400);

  const dailyCapacity = parseInt(getConfig("daily_capacity", "10")) || 10;
  const appointments = query(`
    SELECT a.*, tm.name as mechanic_name FROM appointments a
    LEFT JOIN team_members tm ON a.mechanic_id = tm.id
    WHERE a.appointment_date = ? AND a.status != 'cancelled'
    ORDER BY a.start_time ASC
  `, [date]);
  const holiday = get("SELECT * FROM holidays WHERE date = ? AND applies_to = 'all'", [date]);

  success(res, {
    date,
    isHoliday: !!holiday,
    holiday: holiday || null,
    capacity: { total: dailyCapacity, used: appointments.length, remaining: Math.max(0, dailyCapacity - appointments.length) },
    appointments,
  });
};
