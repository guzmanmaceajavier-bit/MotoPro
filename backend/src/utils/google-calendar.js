const https = require("https");
const { get, query, run } = require("../config/database");

// Uses Google Calendar API v3 via direct HTTP calls (no SDK dependency)

function getConfig() {
  const enabled = get("SELECT value FROM site_config WHERE key = 'google_calendar_enabled'");
  const calendarId = get("SELECT value FROM site_config WHERE key = 'google_calendar_id'");
  const serviceAccount = get("SELECT value FROM site_config WHERE key = 'google_calendar_service_account'");
  return {
    enabled: enabled?.value === "true" || enabled?.value === "1",
    calendarId: calendarId?.value || "primary",
    serviceAccount: serviceAccount?.value ? JSON.parse(serviceAccount.value) : null,
  };
}

async function getAccessToken() {
  const config = getConfig();
  if (!config.serviceAccount) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: config.serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");

  // JWT signing requires crypto - simplified for demo
  // In production, use google-auth-library or jsonwebtoken
  try {
    const crypto = require("crypto");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(`${header}.${payload}`);
    const signature = sign.sign(config.serviceAccount.private_key, "base64url");
    const jwt = `${header}.${payload}.${signature}`;

    const data = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    return new Promise((resolve) => {
      const req = https.request({
        hostname: "oauth2.googleapis.com",
        path: "/token",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(data) },
      }, (res) => {
        let body = "";
        res.on("data", (c) => body += c);
        res.on("end", () => {
          try { resolve(JSON.parse(body).access_token); } catch { resolve(null); }
        });
      });
      req.on("error", () => resolve(null));
      req.write(data);
      req.end();
    });
  } catch { return null; }
}

async function createEvent(appointment) {
  const config = getConfig();
  if (!config.enabled) return null;

  const token = await getAccessToken();
  if (!token) return null;

  const startDate = new Date(appointment.appointment_date);
  const endDate = new Date(startDate.getTime() + (appointment.duration || 60) * 60000);

  const event = {
    summary: `${appointment.service_type} - ${appointment.customer_name}`,
    description: `Cliente: ${appointment.customer_name}\nTel: ${appointment.customer_phone || "N/A"}\nEmail: ${appointment.customer_email || "N/A"}\nNotas: ${appointment.notes || "N/A"}`,
    start: { dateTime: startDate.toISOString(), timeZone: "America/Bogota" },
    end: { dateTime: endDate.toISOString(), timeZone: "America/Bogota" },
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 30 }] },
  };

  return new Promise((resolve) => {
    const data = JSON.stringify(event);
    const req = https.request({
      hostname: "www.googleapis.com",
      path: `/calendar/v3/calendars/${config.calendarId}/events`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    }, (res) => {
      let body = "";
      res.on("data", (c) => body += c);
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          if (result.id) {
            // Store Google event ID for future updates
            if (appointment.id) {
              run("UPDATE appointments SET google_event_id = ? WHERE id = ?", [result.id, appointment.id]);
            }
            resolve(result.id);
          } else { resolve(null); }
        } catch { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.write(data);
    req.end();
  });
}

async function updateEvent(appointment) {
  const config = getConfig();
  if (!config.enabled || !appointment.google_event_id) return false;

  const token = await getAccessToken();
  if (!token) return false;

  const startDate = new Date(appointment.appointment_date);
  const endDate = new Date(startDate.getTime() + (appointment.duration || 60) * 60000);

  const event = {
    summary: `${appointment.service_type} - ${appointment.customer_name}`,
    start: { dateTime: startDate.toISOString(), timeZone: "America/Bogota" },
    end: { dateTime: endDate.toISOString(), timeZone: "America/Bogota" },
  };

  return new Promise((resolve) => {
    const data = JSON.stringify(event);
    const req = https.request({
      hostname: "www.googleapis.com",
      path: `/calendar/v3/calendars/${config.calendarId}/events/${appointment.google_event_id}`,
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    }, (res) => {
      let body = "";
      res.on("data", (c) => body += c);
      res.on("end", () => { resolve(res.statusCode === 200); });
    });
    req.on("error", () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function deleteEvent(googleEventId) {
  const config = getConfig();
  if (!config.enabled || !googleEventId) return false;

  const token = await getAccessToken();
  if (!token) return false;

  return new Promise((resolve) => {
    const req = https.request({
      hostname: "www.googleapis.com",
      path: `/calendar/v3/calendars/${config.calendarId}/events/${googleEventId}`,
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    }, (res) => { resolve(res.statusCode === 204); });
    req.on("error", () => resolve(false));
    req.end();
  });
}

function generateICal(appointments) {
  let ical = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MotoPro//ES\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";
  appointments.forEach((a) => {
    const start = new Date(a.appointment_date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = new Date(new Date(a.appointment_date).getTime() + 3600000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    ical += `BEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${a.service_type} - ${a.customer_name}\nDESCRIPTION:Cliente: ${a.customer_name}\\nTel: ${a.customer_phone || ""}\nEND:VEVENT\n`;
  });
  ical += "END:VCALENDAR";
  return ical;
}

module.exports = { getConfig, createEvent, updateEvent, deleteEvent, generateICal };
