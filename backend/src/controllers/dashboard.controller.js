const { query, get } = require("../config/database");
const { success, error } = require("../utils/helpers");

exports.dashboard = (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    // ── KPIs ──
    const totalClients = get("SELECT COUNT(*) as c FROM customers")?.c || 0;
    const totalProducts = get("SELECT COUNT(*) as c FROM products")?.c || 0;
    const totalServices = get("SELECT COUNT(*) as c FROM services WHERE is_active = 1")?.c || 0;

    const workOrdersTotal = get("SELECT COUNT(*) as c FROM work_orders")?.c || 0;
    const workOrdersActive = get("SELECT COUNT(*) as c FROM work_orders WHERE status NOT IN ('delivered','cancelled')")?.c || 0;
    const workOrdersDelivered = get("SELECT COUNT(*) as c FROM work_orders WHERE status = 'delivered'")?.c || 0;

    const monthRevenue = get(`SELECT COALESCE(SUM(total),0) as c FROM store_orders WHERE created_at >= '${monthStart}' AND status != 'cancelled'`)?.c || 0;
    const monthWorkOrderRevenue = get(`SELECT COALESCE(SUM(total),0) as c FROM work_orders WHERE created_at >= '${monthStart}' AND status = 'delivered'`)?.c || 0;
    const todayRevenue = get(`SELECT COALESCE(SUM(amount),0) as c FROM cash_transactions WHERE type = 'income' AND created_at >= '${today}'`)?.c || 0;

    const pendingInvoices = get("SELECT COUNT(*) as c FROM invoices WHERE status = 'pending'")?.c || 0;
    const pendingQuotes = get("SELECT COUNT(*) as c FROM quotes WHERE status = 'pending' OR status = 'sent'")?.c || 0;
    const todayAppointments = get(`SELECT COUNT(*) as c FROM appointments WHERE appointment_date = '${today}' AND status != 'cancelled'`)?.c || 0;

    // ── Órdenes activas por estado ──
    const ordersByStatus = query(`
      SELECT status, COUNT(*) as count FROM work_orders
      WHERE status NOT IN ('delivered','cancelled')
      GROUP BY status ORDER BY count DESC
    `);

    const activeOrders = query(`
      SELECT wo.id, wo.order_number, wo.customer_name, wo.vehicle_description,
             wo.status, wo.priority, wo.created_at, wo.total,
             tm.name as mechanic_name
      FROM work_orders wo
      LEFT JOIN team_members tm ON wo.assigned_to = tm.id
      WHERE wo.status NOT IN ('delivered','cancelled')
      ORDER BY
        CASE wo.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
        wo.created_at DESC
      LIMIT 10
    `);

    // ── Servicios pendientes (citas de hoy y mañana) ──
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
    const pendingServices = query(`
      SELECT a.id, a.customer_name, a.customer_phone, a.service_type,
             a.appointment_date, a.start_time, a.end_time, a.status,
             tm.name as mechanic_name
      FROM appointments a
      LEFT JOIN team_members tm ON a.mechanic_id = tm.id
      WHERE a.appointment_date IN ('${today}', '${tomorrow}')
      AND a.status NOT IN ('cancelled','completed')
      ORDER BY a.appointment_date ASC, a.start_time ASC
      LIMIT 10
    `);

    // ── Caja del día ──
    const cashRegister = get("SELECT * FROM cash_register WHERE status = 'open' ORDER BY opened_at DESC LIMIT 1");
    let cashSummary = { isOpen: false, openingAmount: 0, income: 0, expenses: 0, balance: 0, transactionCount: 0 };
    if (cashRegister) {
      const totals = get(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses,
          COUNT(*) as transactionCount
        FROM cash_transactions WHERE cash_register_id = '${cashRegister.id}'
      `);
      cashSummary = {
        isOpen: true,
        id: cashRegister.id,
        openingAmount: cashRegister.opening_amount,
        income: totals?.income || 0,
        expenses: totals?.expenses || 0,
        balance: cashRegister.opening_amount + (totals?.income || 0) - (totals?.expenses || 0),
        transactionCount: totals?.transactionCount || 0,
        openedAt: cashRegister.opened_at,
      };
    }

    // ── Mecánicos disponibles ──
    const mechanics = query(`
      SELECT tm.id, tm.name, tm.specialty, tm.image,
        (SELECT COUNT(*) FROM work_orders wo WHERE wo.assigned_to = tm.id AND wo.status NOT IN ('delivered','cancelled')) as activeOrders
      FROM team_members tm
      WHERE tm.role LIKE '%mec%' OR tm.role LIKE '%téc%' OR tm.role LIKE '%tech%' OR tm.specialty IS NOT NULL
      ORDER BY activeOrders ASC
      LIMIT 8
    `);

    // ── Alertas ──
    const alerts = [];

    // Stock bajo
    const lowStock = query("SELECT COUNT(*) as c FROM products WHERE stock <= min_stock AND min_stock > 0");
    if (lowStock[0]?.c > 0) {
      alerts.push({ type: "warning", title: "Stock bajo", message: `${lowStock[0].c} producto(s) por debajo del mínimo`, action: "/inventario" });
    }

    // Órdenes urgentes sin asignar
    const urgentUnassigned = get("SELECT COUNT(*) as c FROM work_orders WHERE priority = 'urgent' AND assigned_to IS NULL AND status NOT IN ('delivered','cancelled')");
    if (urgentUnassigned?.c > 0) {
      alerts.push({ type: "danger", title: "Órdenes urgentes sin asignar", message: `${urgentUnassigned.c} orden(es) urgente(s) esperando mecánico`, action: "/orders" });
    }

    // Citas atrasadas
    const overdueAppointments = get(`SELECT COUNT(*) as c FROM appointments WHERE appointment_date < '${today}' AND status = 'pending'`);
    if (overdueAppointments?.c > 0) {
      alerts.push({ type: "warning", title: "Citas pendientes", message: `${overdueAppointments.c} cita(s) pendiente(s) de días anteriores`, action: "/calendar" });
    }

    // Caja cerrada
    if (!cashRegister) {
      alerts.push({ type: "info", title: "Caja cerrada", message: "No hay caja abierta hoy", action: "/settings" });
    }

    // Cotizaciones por vencer
    const expiringQuotes = get(`SELECT COUNT(*) as c FROM quotes WHERE status = 'sent' AND valid_until < datetime('now', '+2 days')`);
    if (expiringQuotes?.c > 0) {
      alerts.push({ type: "warning", title: "Cotizaciones por vencer", message: `${expiringQuotes.c} cotización(es) vence(n) pronto`, action: "/orders" });
    }

    // ── Actividad reciente (unificada) ──
    const recentWorkOrders = query(`
      SELECT wo.id, wo.order_number, wo.customer_name, wo.status, wo.created_at,
             'work_order' as activity_type
      FROM work_orders wo
      ORDER BY wo.created_at DESC LIMIT 5
    `);

    const recentStoreOrders = query(`
      SELECT id, customer_name, total, status, created_at,
             'store_order' as activity_type
      FROM store_orders
      ORDER BY created_at DESC LIMIT 5
    `);

    const recentCustomers = query(`
      SELECT id, name, email, created_at, 'customer' as activity_type
      FROM customers
      ORDER BY created_at DESC LIMIT 3
    `);

    const recentActivity = [...recentWorkOrders, ...recentStoreOrders, ...recentCustomers]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 8);

    // ── Resumen por mecánico (top 5) ──
    const mechanicPerformance = query(`
      SELECT tm.name,
        COUNT(CASE WHEN wo.status = 'delivered' THEN 1 END) as completed,
        COUNT(CASE WHEN wo.status NOT IN ('delivered','cancelled') THEN 1 END) as in_progress
      FROM team_members tm
      LEFT JOIN work_orders wo ON wo.assigned_to = tm.id
      WHERE wo.created_at >= '${monthStart}' OR wo.created_at IS NULL
      GROUP BY tm.id
      HAVING completed > 0 OR in_progress > 0
      ORDER BY completed DESC
      LIMIT 5
    `);

    success(res, {
      kpis: {
        totalClients,
        totalProducts,
        totalServices,
        workOrdersTotal,
        workOrdersActive,
        workOrdersDelivered,
        monthRevenue,
        monthWorkOrderRevenue,
        todayRevenue,
        pendingInvoices,
        pendingQuotes,
        todayAppointments,
      },
      ordersByStatus,
      activeOrders,
      pendingServices,
      cashSummary,
      mechanics,
      alerts,
      recentActivity,
      mechanicPerformance,
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    error(res, "Error al cargar dashboard", 500);
  }
};
