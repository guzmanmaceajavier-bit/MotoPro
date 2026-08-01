const router = require("express").Router();
const { query, get } = require("../config/database");
const { ok, toSeries } = require("../utils/helpers");

function periodFilter(period) {
  if (period === "today") return "date(created_at) = date('now')";
  if (period === "week") return "created_at >= date('now', '-7 days')";
  if (period === "quarter") return "created_at >= date('now', 'start of month', '-2 months')";
  if (period === "year") return "created_at >= date('now', '-1 year')";
  return "created_at >= date('now', 'start of month')";
}

router.get("/executive", (req, res) => {
  try {
    const { period = "month" } = req.query;
    const df = periodFilter(period);

    const revenue = get(`SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid' AND ${df}`);
    const expenses = get(`SELECT COALESCE(SUM(amount), 0) as total FROM cash_transactions WHERE type = 'expense' AND ${df}`);
    const workOrders = get(`SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM work_orders WHERE ${df}`);
    const completedOrders = get(`SELECT COUNT(*) as count FROM work_orders WHERE status = 'delivered' AND ${df}`);
    const storeSales = get(`SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM store_orders WHERE status IN ('completed','paid') AND ${df}`);
    const newCustomers = get(`SELECT COUNT(*) as count FROM customers WHERE ${df}`);
    const appointments = get(`SELECT COUNT(*) as count FROM appointments WHERE ${df}`);
    const pendingQuotes = get("SELECT COUNT(*) as count FROM quotes WHERE status IN ('pending','sent')");
    const activeOrders = get("SELECT COUNT(*) as count FROM work_orders WHERE status NOT IN ('delivered','cancelled')");
    const avgTicket = get(`SELECT COALESCE(AVG(total), 0) as avg FROM invoices WHERE status = 'paid' AND ${df}`);

    const revenueByDay = query(`SELECT date(created_at) as date, SUM(total) as revenue
      FROM invoices WHERE status = 'paid' AND ${df}
      GROUP BY date(created_at) ORDER BY date`);

    const topServices = query(`SELECT service_type, COUNT(*) as count, SUM(total) as revenue
      FROM work_orders WHERE ${df} AND status = 'delivered'
      GROUP BY service_type ORDER BY count DESC LIMIT 5`);

    const topProducts = query(`SELECT json_extract(je.value, '$.name') as name,
      SUM(json_extract(je.value, '$.quantity')) as sold,
      SUM(json_extract(je.value, '$.quantity') * json_extract(je.value, '$.unit_price')) as revenue
      FROM store_orders so, json_each(so.items) je
      WHERE so.status IN ('completed','paid') AND ${df}
      GROUP BY json_extract(je.value, '$.name') ORDER BY sold DESC LIMIT 5`);

    const totalRevenue = revenue?.total || 0;
    const totalExpenses = expenses?.total || 0;

    ok(res, {
      revenue: totalRevenue,
      profit: totalRevenue - totalExpenses,
      completedOrders: completedOrders?.count || 0,
      newCustomers: newCustomers?.count || 0,
      workOrders: workOrders?.count || 0,
      workOrderRevenue: workOrders?.revenue || 0,
      storeSales: storeSales?.count || 0,
      storeRevenue: storeSales?.revenue || 0,
      appointments: appointments?.count || 0,
      pendingQuotes: pendingQuotes?.count || 0,
      activeOrders: activeOrders?.count || 0,
      avgTicket: Math.round(avgTicket?.avg || 0),
      trend: toSeries(revenueByDay, "date", "revenue"),
      topServices: toSeries(topServices, "service_type", "count"),
      topProducts: toSeries(topProducts, "name", "sold"),
    });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: "Error" }); }
});

router.get("/financial", (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFrom = from || new Date(new Date().setDate(1)).toISOString().split("T")[0];
    const dateTo = to || new Date().toISOString().split("T")[0];
    const dateToEnd = `${dateTo} 23:59:59`;

    const serviceRevenue = get(`SELECT COALESCE(SUM(total), 0) as total FROM work_orders WHERE status = 'delivered' AND created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const storeRevenue = get(`SELECT COALESCE(SUM(total), 0) as total FROM store_orders WHERE status IN ('completed','paid') AND created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const invoices = get(`SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM invoices WHERE created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const totalPaid = get(`SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid' AND created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const totalPending = get(`SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status != 'paid' AND created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const totalExpenses = get(`SELECT COALESCE(SUM(amount), 0) as total FROM cash_transactions WHERE type = 'expense' AND created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const netProfit = (totalPaid?.total || 0) - (totalExpenses?.total || 0);

    const revenueByMonth = query(`SELECT strftime('%Y-%m', created_at) as month, SUM(total) as revenue
      FROM invoices WHERE status = 'paid' AND created_at >= ? GROUP BY month ORDER BY month`, [dateFrom + " -12 months"]);

    const expensesByCategory = query(`SELECT category, SUM(amount) as total
      FROM cash_transactions WHERE type = 'expense' AND created_at BETWEEN ? AND ?
      GROUP BY category ORDER BY total DESC`, [dateFrom, dateToEnd]);

    const paymentsByMethod = query(`SELECT payment_method, COUNT(*) as count, SUM(total) as total
      FROM invoices WHERE status = 'paid' AND created_at BETWEEN ? AND ?
      GROUP BY payment_method ORDER BY total DESC`, [dateFrom, dateToEnd]);

    ok(res, {
      revenue: totalPaid?.total || 0,
      expenses: totalExpenses?.total || 0,
      profit: netProfit,
      invoices: invoices?.count || 0,
      payments: totalPaid?.count || 0,
      pending: totalPending?.total || 0,
      serviceRevenue: serviceRevenue?.total || 0,
      storeRevenue: storeRevenue?.total || 0,
      totalInvoiced: invoices?.total || 0,
      profitMargin: totalPaid?.total > 0 ? Math.round((netProfit / totalPaid.total) * 100) : 0,
      byMonth: toSeries(revenueByMonth, "month", "revenue"),
      byPaymentMethod: toSeries(paymentsByMethod, "payment_method", "total"),
      expensesByCategory: toSeries(expensesByCategory, "category", "total"),
    });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: "Error" }); }
});

router.get("/workshop", (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFrom = from || new Date(new Date().setDate(1)).toISOString().split("T")[0];
    const dateTo = to || new Date().toISOString().split("T")[0];
    const dateToEnd = `${dateTo} 23:59:59`;

    const totalOrders = get(`SELECT COUNT(*) as count FROM work_orders wo WHERE wo.created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const deliveredOrders = get(`SELECT COUNT(*) as count FROM work_orders wo WHERE wo.status = 'delivered' AND wo.created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const byStatus = query(`SELECT wo.status, COUNT(*) as count FROM work_orders wo WHERE wo.created_at BETWEEN ? AND ? GROUP BY wo.status`, [dateFrom, dateToEnd]);
    const byServiceType = query(`SELECT wo.service_type, COUNT(*) as count, AVG(wo.total) as avg_total
      FROM work_orders wo WHERE wo.created_at BETWEEN ? AND ? GROUP BY wo.service_type ORDER BY count DESC`, [dateFrom, dateToEnd]);
    const avgCompletionTime = get(`SELECT AVG(julianday(wo.actual_completion) - julianday(wo.created_at)) as avg_days
      FROM work_orders wo WHERE wo.status = 'delivered' AND wo.actual_completion IS NOT NULL AND wo.created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const avgPartsCost = get(`SELECT AVG(wop.total) as avg FROM work_order_parts wop
      JOIN work_orders wo ON wop.work_order_id = wo.id
      WHERE wo.created_at BETWEEN ? AND ? AND wop.total > 0`, [dateFrom, dateToEnd]);
    const avgLaborCost = get(`SELECT AVG(wo.total - COALESCE((SELECT SUM(total) FROM work_order_parts WHERE work_order_id = wo.id), 0)) as avg
      FROM work_orders wo WHERE wo.created_at BETWEEN ? AND ? AND wo.total > 0`, [dateFrom, dateToEnd]);
    const cancelledRate = get(`SELECT COUNT(CASE WHEN wo.status = 'cancelled' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as rate
      FROM work_orders wo WHERE wo.created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);
    const warrantyClaims = get(`SELECT COUNT(*) as count FROM warranties WHERE created_at BETWEEN ? AND ?`, [dateFrom, dateToEnd]);

    const mechanicPerformance = query(`SELECT tm.name as mechanic_name,
      COUNT(wo.id) as orders_completed,
      AVG(julianday(wo.actual_completion) - julianday(wo.created_at)) as avg_days,
      SUM(wo.total) as total_revenue
      FROM work_orders wo
      JOIN team_members tm ON wo.assigned_to = tm.id
      WHERE wo.status = 'delivered' AND wo.actual_completion IS NOT NULL AND wo.created_at BETWEEN ? AND ?
      GROUP BY tm.name ORDER BY orders_completed DESC`, [dateFrom, dateToEnd]);

    const partsUsage = query(`SELECT wop.name, SUM(wop.quantity) as total_qty, SUM(wop.total) as total_cost
      FROM work_order_parts wop
      JOIN work_orders wo ON wop.work_order_id = wo.id
      WHERE wo.created_at BETWEEN ? AND ?
      GROUP BY wop.name ORDER BY total_qty DESC LIMIT 10`, [dateFrom, dateToEnd]);

    const total = totalOrders?.count || 0;
    ok(res, {
      total,
      avgDays: Math.round((avgCompletionTime?.avg_days || 0) * 10) / 10,
      warrantyClaims: warrantyClaims?.count || 0,
      completionRate: total > 0 ? Math.round(((deliveredOrders?.count || 0) / total) * 100) : 0,
      byStatus: toSeries(byStatus, "status", "count"),
      byMechanic: toSeries(mechanicPerformance, "mechanic_name", "orders_completed"),
      byServiceType: toSeries(byServiceType, "service_type", "count"),
      avgPartsCost: Math.round(avgPartsCost?.avg || 0),
      avgLaborCost: Math.round(avgLaborCost?.avg || 0),
      cancelledRate: Math.round(cancelledRate?.rate || 0),
      partsUsage,
    });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: "Error" }); }
});

router.get("/inventory", (req, res) => {
  try {
    const totalProducts = get("SELECT COUNT(*) as count FROM products WHERE is_active = 1");
    const totalValue = get("SELECT COALESCE(SUM(stock * purchase_price), 0) as total FROM products WHERE is_active = 1");
    const lowStock = get("SELECT COUNT(*) as count FROM products WHERE is_active = 1 AND stock <= min_stock AND stock > 0");
    const outOfStock = get("SELECT COUNT(*) as count FROM products WHERE is_active = 1 AND stock = 0");
    const overStock = get("SELECT COUNT(*) as count FROM products WHERE is_active = 1 AND stock >= max_stock AND max_stock > 0");

    const byCategory = query(`SELECT c.name as category, COUNT(p.id) as count, SUM(p.stock) as total_stock, SUM(p.stock * p.purchase_price) as value
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 GROUP BY c.name ORDER BY value DESC`);

    const lowStockItems = query(`SELECT p.name, p.sku, p.stock, p.min_stock, p.purchase_price, c.name as category
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.stock <= p.min_stock AND p.stock > 0
      ORDER BY (p.stock * 1.0 / p.min_stock) ASC LIMIT 20`);

    const outOfStockItems = query(`SELECT p.name, p.sku, p.purchase_price, c.name as category
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.stock = 0 ORDER BY p.name LIMIT 20`);

    const topSelling = query(`SELECT json_extract(je.value, '$.name') as name,
      SUM(json_extract(je.value, '$.quantity')) as sold,
      SUM(json_extract(je.value, '$.quantity') * json_extract(je.value, '$.unit_price')) as revenue
      FROM store_orders so, json_each(so.items) je
      WHERE so.status IN ('completed','paid')
      GROUP BY json_extract(je.value, '$.name') ORDER BY sold DESC LIMIT 10`);

    const movements = query(`SELECT im.type, COUNT(*) as count, SUM(im.quantity) as total_qty
      FROM inventory_movements im
      WHERE im.created_at >= date('now', '-30 days')
      GROUP BY im.type`);

    ok(res, {
      totalProducts: totalProducts?.count || 0,
      totalValue: totalValue?.total || 0,
      lowStock: lowStock?.count || 0,
      outOfStock: outOfStock?.count || 0,
      overStock: overStock?.count || 0,
      byCategory: toSeries(byCategory, "category", "count"),
      lowStockItems,
      outOfStockItems,
      topSelling: toSeries(topSelling, "name", "sold"),
      recentMovements: movements,
    });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: "Error" }); }
});

router.get("/customers", (req, res) => {
  try {
    const totalCustomers = get("SELECT COUNT(*) as count FROM customers");
    const newThisMonth = get("SELECT COUNT(*) as count FROM customers WHERE created_at >= date('now', 'start of month')");
    const avgSpent = get("SELECT COALESCE(AVG(total_spent), 0) as avg FROM customers WHERE total_spent > 0");
    const recurrent = get("SELECT COUNT(*) as count FROM customers WHERE total_orders >= 2");
    const topSpenders = query(`SELECT name, email, total_spent, total_orders, created_at
      FROM customers ORDER BY total_spent DESC LIMIT 10`);
    const customersByOrders = query(`SELECT
      CASE WHEN total_orders = 0 THEN '0' WHEN total_orders <= 2 THEN '1-2' WHEN total_orders <= 5 THEN '3-5' ELSE '6+' END as range,
      COUNT(*) as count FROM customers GROUP BY range ORDER BY range`);
    const recentActivity = query(`SELECT c.name, wo.order_number, wo.status, wo.created_at
      FROM work_orders wo JOIN customers c ON wo.customer_id = c.id
      ORDER BY wo.created_at DESC LIMIT 10`);

    const total = totalCustomers?.count || 0;
    ok(res, {
      total,
      newThisMonth: newThisMonth?.count || 0,
      retentionRate: total > 0 ? Math.round(((recurrent?.count || 0) / total) * 100) : 0,
      avgSpent: Math.round(avgSpent?.avg || 0),
      topSpenders: toSeries(topSpenders, "name", "total_spent"),
      byOrders: toSeries(customersByOrders, "range", "count"),
      recentActivity,
    });
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: "Error" }); }
});

router.get("/mechanics", (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFrom = from || new Date(new Date().setDate(1)).toISOString().split("T")[0];
    const dateTo = to || new Date().toISOString().split("T")[0];
    const dateToEnd = `${dateTo} 23:59:59`;

    const mechanics = query(`SELECT tm.id, tm.name, tm.specialty,
      COUNT(CASE WHEN wo.status = 'delivered' THEN 1 END) as completed,
      COUNT(CASE WHEN wo.status IN ('in_progress','diagnosed') THEN 1 END) as in_progress,
      AVG(CASE WHEN wo.status = 'delivered' AND wo.actual_completion IS NOT NULL
        THEN julianday(wo.actual_completion) - julianday(wo.created_at) END) as avg_days,
      SUM(CASE WHEN wo.status = 'delivered' THEN wo.total ELSE 0 END) as revenue,
      (SELECT COUNT(*) FROM satisfaction_surveys s JOIN work_orders wo2 ON s.work_order_id = wo2.id
        WHERE wo2.assigned_to = tm.id AND s.created_at BETWEEN ? AND ?
      ) as survey_count,
      (SELECT AVG(s2.rating) FROM satisfaction_surveys s2 JOIN work_orders wo3 ON s2.work_order_id = wo3.id
        WHERE wo3.assigned_to = tm.id
      ) as avg_rating
      FROM team_members tm
      LEFT JOIN work_orders wo ON wo.assigned_to = tm.id AND wo.created_at BETWEEN ? AND ?
      WHERE tm.is_active = 1
      GROUP BY tm.id ORDER BY completed DESC`, [dateFrom, dateToEnd, dateFrom, dateToEnd]);

    ok(res, mechanics);
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: "Error" }); }
});

router.get("/export/:type", (req, res) => {
  try {
    const { type } = req.params;
    const { from, to, format = "csv" } = req.query;
    const dateFrom = from || new Date(new Date().setDate(1)).toISOString().split("T")[0];
    const dateTo = to || new Date().toISOString().split("T")[0];
    const dateToEnd = `${dateTo} 23:59:59`;

    let data, filename;

    if (type === "work-orders") {
      data = query(`SELECT wo.order_number, wo.service_type, wo.status, wo.total, wo.created_at,
        wo.customer_name, wo.vehicle_description
        FROM work_orders wo WHERE wo.created_at BETWEEN ? AND ?
        ORDER BY wo.created_at DESC`, [dateFrom, dateToEnd]);
      filename = `ordenes-servicio-${dateFrom}-${dateTo}`;
    } else if (type === "invoices") {
      data = query(`SELECT invoice_number, total, status, payment_method, created_at
        FROM invoices WHERE created_at BETWEEN ? AND ?
        ORDER BY created_at DESC`, [dateFrom, dateToEnd]);
      filename = `facturas-${dateFrom}-${dateTo}`;
    } else if (type === "inventory") {
      data = query(`SELECT p.name, p.sku, p.stock, p.min_stock, p.purchase_price, p.price, c.name as category
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1 ORDER BY p.name`);
      filename = `inventario-${dateFrom}`;
    } else if (type === "customers") {
      data = query(`SELECT name, email, phone, total_orders, total_spent, created_at
        FROM customers ORDER BY created_at DESC`);
      filename = `clientes-${dateFrom}`;
    } else if (type === "sales") {
      data = query(`SELECT so.order_number, so.total, so.status, so.payment_method, so.created_at
        FROM store_orders so WHERE so.created_at BETWEEN ? AND ?
        ORDER BY so.created_at DESC`, [dateFrom, dateToEnd]);
      filename = `ventas-${dateFrom}-${dateTo}`;
    } else {
      return res.status(400).json({ success: false, message: "Tipo de reporte no válido" });
    }

    if (format === "excel") {
      res.setHeader("Content-Type", "application/vnd.ms-excel");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.xls"`);
      let html = '<html><head><meta charset="utf-8"></head><body><table border="1">';
      if (data.length > 0) {
        html += "<tr>" + Object.keys(data[0]).map(k => `<th style="background:#0D9488;color:white;padding:8px">${k}</th>`).join("") + "</tr>";
        data.forEach(row => {
          html += "<tr>" + Object.values(row).map(v => `<td style="padding:6px">${v ?? ""}</td>`).join("") + "</tr>";
        });
      }
      html += "</table></body></html>";
      return res.send(html);
    }

    // CSV default
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
    if (data.length === 0) return res.send("Sin datos");

    const BOM = "\uFEFF";
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    res.send(BOM + headers + "\n" + rows);
  } catch (err) { console.error(err); res.status(500).json({ success: false, message: "Error" }); }
});

module.exports = router;
