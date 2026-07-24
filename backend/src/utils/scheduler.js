const { query, get } = require("../config/database");
const { sendEmail } = require("./email-templates");

let intervalId = null;
const INTERVAL_MS = 60 * 60 * 1000; // Run every hour


async function appointmentReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const appointments = query(
      `SELECT a.*, c.email, c.name as customer_name
       FROM appointments a
       JOIN customers c ON a.customer_id = c.id
       WHERE date(a.appointment_date) = ? AND a.status = 'confirmed'`,
      [dateStr]
    );

    for (const appt of appointments) {
      if (appt.email) {
        await sendEmail("appointmentReminder", {
          customer_name: appt.customer_name,
          service_type: appt.service_type,
          date: new Date(appt.appointment_date).toLocaleDateString("es-ES"),
          time: new Date(appt.appointment_date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        }, appt.email);
      }
    }
    if (appointments.length > 0) console.log(`  ✓ Sent ${appointments.length} appointment reminders`);
  } catch (err) {
    console.error("Appointment reminders error:", err.message);
  }
}

async function quoteExpirationCheck() {
  try {
    const expiring = query(
      `SELECT q.*, c.email, c.name as customer_name, wo.customer_email, wo.customer_name as wo_customer_name
       FROM quotes q
       JOIN work_orders wo ON q.work_order_id = wo.id
       LEFT JOIN customers c ON wo.customer_id = c.id
       WHERE q.status IN ('pending', 'sent')
       AND q.valid_until < datetime('now') AND q.valid_until > datetime('now', '-1 hour')`
    );

    for (const quote of expiring) {
      const { run } = require("../config/database");
      run("UPDATE quotes SET status = 'expired' WHERE id = ?", [quote.id]);
      const email = quote.email || quote.customer_email;
      const name = quote.customer_name || quote.wo_customer_name;
      if (email) {
        await sendEmail("statusChange", {
          customer_name: name,
          order_number: quote.quote_number,
          status: "expired",
          message: "Tu cotización ha expirado. Contacta al taller para generar una nueva.",
        }, email);
      }
    }
    if (expiring.length > 0) console.log(`  ✓ Expired ${expiring.length} quotes`);
  } catch (err) {
    console.error("Quote expiration error:", err.message);
  }
}

async function warrantyExpiryCheck() {
  try {
    const expiring = query(
      `SELECT w.*, c.email, c.name as customer_name, wo.order_number, wo.service_type
       FROM warranties w
       JOIN work_orders wo ON w.entity_id = wo.id
       LEFT JOIN customers c ON wo.customer_id = c.id
       WHERE w.status = 'active' AND w.entity_type = 'work_order'
       AND date(w.end_date) BETWEEN date('now') AND date('now', '+7 days')`
    );

    for (const w of expiring) {
      const endDate = new Date(w.end_date);
      const now = new Date();
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      const email = w.email || w.customer_email;
      const name = w.customer_name || w.wo_customer_name;
      if (email) {
        await sendEmail("warrantyExpiring", {
          customer_name: name,
          order_number: w.order_number,
          service_type: w.service_type,
          days_left: daysLeft,
          end_date: endDate.toLocaleDateString("es-ES"),
        }, email);
      }
    }
    if (expiring.length > 0) console.log(`  ✓ Sent ${expiring.length} warranty expiry warnings`);
  } catch (err) {
    console.error("Warranty expiry error:", err.message);
  }
}

async function maintenanceReminders() {
  try {
    // Find vehicles that haven't had service in 6+ months or 10000km
    const vehicles = query(
      `SELECT v.*, c.email, c.name as customer_name
       FROM vehicles v
       JOIN customers c ON v.customer_id = c.id
       WHERE v.customer_id IS NOT NULL
       AND v.last_service_date IS NOT NULL
       AND (julianday('now') - julianday(v.last_service_date)) > 180`
    );

    for (const v of vehicles) {
      if (v.email) {
        await sendEmail("maintenanceReminder", {
          customer_name: v.customer_name,
          vehicle: `${v.brand} ${v.model}`,
          last_service: v.last_service_date ? new Date(v.last_service_date).toLocaleDateString("es-ES") : "No registrado",
          current_mileage: v.mileage,
          next_service_mileage: v.mileage ? Math.ceil(v.mileage / 10000) * 10000 : null,
        }, v.email);
      }
    }
    if (vehicles.length > 0) console.log(`  ✓ Sent ${vehicles.length} maintenance reminders`);
  } catch (err) {
    console.error("Maintenance reminders error:", err.message);
  }
}

async function oilChangeReminders() {
  try {
    const vehicles = query(
      `SELECT v.*, c.email, c.name as customer_name
       FROM vehicles v
       JOIN customers c ON v.customer_id = c.id
       WHERE v.customer_id IS NOT NULL
       AND v.last_oil_change IS NOT NULL
       AND (julianday('now') - julianday(v.last_oil_change)) > 120`
    );

    for (const v of vehicles) {
      if (v.email) {
        await sendEmail("oilChangeReminder", {
          customer_name: v.customer_name,
          vehicle: `${v.brand} ${v.model}`,
          last_change: v.last_oil_change ? new Date(v.last_oil_change).toLocaleDateString("es-ES") : "No registrado",
          current_mileage: v.mileage,
        }, v.email);
      }
    }
    if (vehicles.length > 0) console.log(`  ✓ Sent ${vehicles.length} oil change reminders`);
  } catch (err) {
    console.error("Oil change reminders error:", err.message);
  }
}

async function satisfactionSurveyTrigger() {
  try {
    const delivered = query(
      `SELECT wo.*, c.email, c.name as customer_name
       FROM work_orders wo
       JOIN customers c ON wo.customer_id = c.id
       WHERE wo.status = 'delivered'
       AND wo.survey_sent IS NULL
       AND wo.actual_completion > datetime('now', '-3 days')`
    );

    for (const order of delivered) {
      if (order.email) {
        const surveyId = `survey-${order.id}`;
        await sendEmail("satisfactionSurvey", {
          customer_name: order.customer_name,
          vehicle: order.vehicle_description,
          survey_id: surveyId,
          order_number: order.order_number,
        }, order.email);
        const { run } = require("../config/database");
        run("UPDATE work_orders SET survey_sent = datetime('now') WHERE id = ?", [order.id]);
      }
    }
    if (delivered.length > 0) console.log(`  ✓ Sent ${delivered.length} satisfaction surveys`);
  } catch (err) {
    console.error("Satisfaction survey error:", err.message);
  }
}

async function runAllTasks() {
  console.log("\n⏰ Running scheduled tasks...");
  await appointmentReminders();
  await quoteExpirationCheck();
  await warrantyExpiryCheck();
  await maintenanceReminders();
  await oilChangeReminders();
  await satisfactionSurveyTrigger();
  console.log("⏰ Scheduled tasks complete\n");
}

function startScheduler() {
  if (intervalId) return;
  console.log("  ✓ Scheduler started (runs every hour)");
  // Run once on startup (delayed 30s to let server warm up)
  setTimeout(runAllTasks, 30000);
  // Then every hour
  intervalId = setInterval(runAllTasks, INTERVAL_MS);
}

function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("  ✓ Scheduler stopped");
  }
}

module.exports = { startScheduler, stopScheduler, runAllTasks };
