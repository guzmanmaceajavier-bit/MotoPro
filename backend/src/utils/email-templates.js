const { sendMail, notifyAdmin } = require("./notifications");
const { get, query } = require("../config/database");

const templates = {
  // ── Appointment ──
  appointmentConfirmation: (data) => ({
    subject: `Cita confirmada - ${data.service_type}`,
    html: baseTemplate(`
      <h2 style="color:#0D9488;margin:0 0 8px">Cita Confirmada</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>Tu cita ha sido confirmada:</p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #e2e8f0">
        <p style="margin:4px 0"><strong>Servicio:</strong> ${data.service_type}</p>
        <p style="margin:4px 0"><strong>Fecha:</strong> ${data.date}</p>
        <p style="margin:4px 0"><strong>Hora:</strong> ${data.time}</p>
        ${data.mechanic ? `<p style="margin:4px 0"><strong>Mecánico:</strong> ${data.mechanic}</p>` : ""}
      </div>
      <p>Si necesitas reprogramar, contáctanos.</p>
    `),
  }),

  appointmentReminder: (data) => ({
    subject: `Recordatorio: tu cita es mañana`,
    html: baseTemplate(`
      <h2 style="color:#F59E0B;margin:0 0 8px">Recordatorio de Cita</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>Te recordamos que tienes una cita programada para mañana:</p>
      <div style="background:#FFFBEB;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #FDE68A">
        <p style="margin:4px 0"><strong>Servicio:</strong> ${data.service_type}</p>
        <p style="margin:4px 0"><strong>Fecha:</strong> ${data.date}</p>
        <p style="margin:4px 0"><strong>Hora:</strong> ${data.time}</p>
      </div>
      <p>Por favor llega 10 minutos antes. ¡Te esperamos!</p>
    `),
  }),

  // ── Work Order Status ──
  statusChange: (data) => ({
    subject: `Estado actualizado: ${data.order_number}`,
    html: baseTemplate(`
      <h2 style="color:#3B82F6;margin:0 0 8px">Actualización de Servicio</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>El estado de tu servicio <strong>${data.order_number}</strong> ha cambiado:</p>
      <div style="background:#EFF6FF;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #BFDBFE;text-align:center">
        <p style="margin:0;font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:1px">Nuevo Estado</p>
        <p style="margin:8px 0 0;font-size:20px;font-weight:bold;color:#1E40AF">${statusLabel(data.status)}</p>
      </div>
      ${data.message ? `<p>${data.message}</p>` : ""}
      <p style="margin-top:16px"><a href="${process.env.SITE_URL || "http://localhost:3000"}/estado?orden=${data.order_number}" style="display:inline-block;background:#0D9488;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600">Ver estado</a></p>
    `),
  }),

  // ── Quote ──
  quoteCreated: (data) => ({
    subject: `Nueva cotización: ${data.quote_number}`,
    html: baseTemplate(`
      <h2 style="color:#8B5CF6;margin:0 0 8px">Nueva Cotización</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>Hemos preparado la cotización para tu servicio:</p>
      <div style="background:#F5F3FF;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #DDD6FE">
        <p style="margin:4px 0"><strong>Cotización:</strong> ${data.quote_number}</p>
        <p style="margin:4px 0"><strong>Servicio:</strong> ${data.service_type}</p>
        <p style="margin:4px 0;font-size:20px;font-weight:bold;color:#7C3AED">Total: $${Number(data.total).toLocaleString()}</p>
      </div>
      <p>Revisa los detalles y aprueba para continuar.</p>
      <p style="margin-top:16px"><a href="${process.env.SITE_URL || "http://localhost:3000"}/cotizaciones" style="display:inline-block;background:#8B5CF6;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600">Ver cotización</a></p>
    `),
  }),

  quoteApproved: (data) => ({
    subject: `Cotización aprobada: ${data.quote_number}`,
    html: baseTemplate(`
      <h2 style="color:#22C55E;margin:0 0 8px">Cotización Aprobada</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>Tu cotización <strong>${data.quote_number}</strong> ha sido aprobada. ¡Comenzaremos a trabajar en tu servicio!</p>
      <div style="background:#F0FDF4;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #BBF7D0;text-align:center">
        <p style="margin:0;font-size:20px;font-weight:bold;color:#16A34A">$${Number(data.total).toLocaleString()}</p>
      </div>
    `),
  }),

  // ── Delivery ──
  readyForDelivery: (data) => ({
    subject: `Tu moto está lista: ${data.order_number}`,
    html: baseTemplate(`
      <h2 style="color:#22C55E;margin:0 0 8px">¡Tu moto está lista!</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>Tu servicio <strong>${data.order_number}</strong> ha sido completado y tu moto está lista para recoger.</p>
      <div style="background:#F0FDF4;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #BBF7D0">
        <p style="margin:4px 0"><strong>Orden:</strong> ${data.order_number}</p>
        ${data.total ? `<p style="margin:4px 0"><strong>Total:</strong> $${Number(data.total).toLocaleString()}</p>` : ""}
      </div>
      <p>Horario de atención: Lunes a Viernes 8:00 - 18:00, Sábados 8:00 - 13:00</p>
    `),
  }),

  // ── Warranty ──
  warrantyExpiring: (data) => ({
    subject: `Tu garantía vence en ${data.days_left} días`,
    html: baseTemplate(`
      <h2 style="color:#F59E0B;margin:0 0 8px">Garantía por vencer</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>Tu garantía del servicio <strong>${data.order_number}</strong> vence en <strong>${data.days_left} días</strong>.</p>
      <div style="background:#FFFBEB;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #FDE68A">
        <p style="margin:4px 0"><strong>Servicio:</strong> ${data.service_type}</p>
        <p style="margin:4px 0"><strong>Vence:</strong> ${data.end_date}</p>
      </div>
      <p>Si tienes algún problema, contáctanos antes de que venza.</p>
    `),
  }),

  // ── Maintenance Reminder ──
  maintenanceReminder: (data) => ({
    subject: `Recordatorio: mantenimiento de tu ${data.vehicle}`,
    html: baseTemplate(`
      <h2 style="color:#0D9488;margin:0 0 8px">Recordatorio de Mantenimiento</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>Tu <strong>${data.vehicle}</strong> necesita mantenimiento.</p>
      <div style="background:#F0FDFA;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #99F6E4">
        <p style="margin:4px 0"><strong>Último servicio:</strong> ${data.last_service || "No registrado"}</p>
        <p style="margin:4px 0"><strong>Kilometraje actual:</strong> ${data.current_mileage?.toLocaleString() || "N/A"} km</p>
        <p style="margin:4px 0"><strong>Próximo servicio:</strong> ${data.next_service_mileage?.toLocaleString() || "N/A"} km</p>
      </div>
      <p style="margin-top:16px"><a href="${process.env.SITE_URL || "http://localhost:3000"}/agendar-cita" style="display:inline-block;background:#0D9488;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600">Agendar cita</a></p>
    `),
  }),

  // ── Oil Change Reminder ──
  oilChangeReminder: (data) => ({
    subject: `Recordatorio: cambio de aceite de tu ${data.vehicle}`,
    html: baseTemplate(`
      <h2 style="color:#F59E0B;margin:0 0 8px">Cambio de Aceite</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>Es momento de cambiar el aceite de tu <strong>${data.vehicle}</strong>.</p>
      <div style="background:#FFFBEB;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #FDE68A">
        <p style="margin:4px 0"><strong>Último cambio:</strong> ${data.last_change || "No registrado"}</p>
        <p style="margin:4px 0"><strong>Kilometraje:</strong> ${data.current_mileage?.toLocaleString() || "N/A"} km</p>
      </div>
      <p style="margin-top:16px"><a href="${process.env.SITE_URL || "http://localhost:3000"}/agendar-cita" style="display:inline-block;background:#F59E0B;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600">Agendar cambio</a></p>
    `),
  }),

  // ── Satisfaction Survey ──
  satisfactionSurvey: (data) => ({
    subject: `¿Qué tal tu experiencia?`,
    html: baseTemplate(`
      <h2 style="color:#0D9488;margin:0 0 8px">Cuéntanos tu experiencia</h2>
      <p>Hola <strong>${data.customer_name}</strong>,</p>
      <p>Esperamos que estés disfrutando tu <strong>${data.vehicle || "moto"}</strong>. Nos encantaría conocer tu opinión sobre el servicio recibido.</p>
      <div style="text-align:center;margin:24px 0">
        <p style="margin:0 0 12px;font-size:14px;color:#64748B">¿Cómo calificarías tu experiencia?</p>
        <div style="display:inline-flex;gap:8px">
          ${[1,2,3,4,5].map(n => `<a href="${process.env.SITE_URL || "http://localhost:3000"}/encuesta/${data.survey_id}?rating=${n}" style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:${n >= 4 ? '#F0FDF4' : n === 3 ? '#FFFBEB' : '#FEF2F2'};color:${n >= 4 ? '#16A34A' : n === 3 ? '#D97706' : '#DC2626'};font-size:20px;font-weight:bold;text-decoration:none;border:1px solid ${n >= 4 ? '#BBF7D0' : n === 3 ? '#FDE68A' : '#FECACA'}">${n}</a>`).join("")}
        </div>
      </div>
      <p style="text-align:center;color:#94A3B8;font-size:12px">1 = Muy malo, 5 = Excelente</p>
    `),
  }),
};

function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="text-align:center;padding:24px 0">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:#0D9488">
        <span style="color:white;font-size:20px">M</span>
      </div>
      <h1 style="margin:8px 0 0;font-size:20px;color:#0F172A">MotoPro</h1>
    </div>
    <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
      ${content}
    </div>
    <div style="text-align:center;padding:24px 0;color:#94A3B8;font-size:12px">
      <p style="margin:0">MotoPro - Taller de Motocicletas</p>
      <p style="margin:4px 0 0">Este es un correo automático, no respondas a este mensaje.</p>
    </div>
  </div>
</body></html>`;
}

function statusLabel(status) {
  const labels = {
    received: "Recibido", diagnosed: "Diagnosticado", quoted: "Cotizado",
    approved: "Aprobado", in_progress: "En Reparación", quality_check: "Control Calidad",
    ready: "Listo para Entregar", delivered: "Entregado", cancelled: "Cancelado",
  };
  return labels[status] || status;
}

async function sendEmail(templateName, data, toEmail) {
  try {
    const tmpl = templates[templateName];
    if (!tmpl) throw new Error(`Template "${templateName}" not found`);
    const { subject, html } = tmpl(data);
    await sendMail({ to: toEmail, subject, html });
    return true;
  } catch (err) {
    console.error(`Email send error (${templateName}):`, err.message);
    return false;
  }
}

async function notifyAdminEmail(subject, html) {
  try { await notifyAdmin(subject, html); } catch {}
}

// Call these from controllers after state changes

async function onAppointmentCreated(appointment) {
  const customer = get("SELECT email, name FROM customers WHERE id = ?", [appointment.customer_id]);
  if (customer?.email) {
    await sendEmail("appointmentConfirmation", {
      customer_name: customer.name,
      service_type: appointment.service_type,
      date: new Date(appointment.appointment_date).toLocaleDateString("es-ES"),
      time: new Date(appointment.appointment_date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      mechanic: appointment.mechanic_name,
    }, customer.email);
  }
}

async function onWorkOrderStatusChanged(order, oldStatus, message) {
  const customer = get("SELECT email, name FROM customers WHERE id = ?", [order.customer_id]);
  if (customer?.email) {
    await sendEmail("statusChange", {
      customer_name: customer.name,
      order_number: order.order_number,
      status: order.status,
      message,
    }, customer.email);
  }
  // Notify admin
  await notifyAdminEmail(
    `Orden ${order.order_number} → ${statusLabel(order.status)}`,
    `<p>La orden <strong>${order.order_number}</strong> cambió de <strong>${statusLabel(oldStatus)}</strong> a <strong>${statusLabel(order.status)}</strong></p>`
  );
}

async function onQuoteCreated(quote, customerEmail, customerName) {
  if (customerEmail) {
    await sendEmail("quoteCreated", {
      customer_name: customerName,
      quote_number: quote.quote_number,
      service_type: quote.service_type,
      total: quote.total,
    }, customerEmail);
  }
}

async function onQuoteApproved(quote, customerEmail, customerName) {
  if (customerEmail) {
    await sendEmail("quoteApproved", {
      customer_name: customerName,
      quote_number: quote.quote_number,
      total: quote.total,
    }, customerEmail);
  }
}

async function onDelivery(order) {
  const customer = get("SELECT email, name FROM customers WHERE id = ?", [order.customer_id]);
  if (customer?.email) {
    await sendEmail("readyForDelivery", {
      customer_name: customer.name,
      order_number: order.order_number,
      total: order.total,
    }, customer.email);
  }
}

module.exports = {
  templates,
  sendEmail,
  notifyAdminEmail,
  onAppointmentCreated,
  onWorkOrderStatusChanged,
  onQuoteCreated,
  onQuoteApproved,
  onDelivery,
  statusLabel,
};
