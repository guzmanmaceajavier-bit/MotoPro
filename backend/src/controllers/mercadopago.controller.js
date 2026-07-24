const { MercadoPagoConfig, Preference } = require("mercadopago");
const { run } = require("../config/database");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
  options: { timeout: 5000 },
});

exports.createPreference = async (req, res) => {
  try {
    const { items, customer, orderId, total } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: "Carrito vacío" });

    const preference = new Preference(client);
    const body = {
      items: items.map((item) => ({
        id: item.id,
        title: item.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: "COP",
      })),
      payer: {
        name: customer?.name || "Cliente",
        email: customer?.email || "",
        phone: { number: customer?.phone || "" },
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout?success=1&order=${orderId}`,
        failure: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout?failure=1`,
        pending: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout?pending=1`,
      },
      auto_return: "approved",
      external_reference: orderId,
      notification_url: `${process.env.BACKEND_URL || "http://localhost:4000"}/api/mercadopago/webhook`,
      statement_descriptor: "MotoPro Taller",
    };

    const result = await preference.create({ body });
    res.json({
      success: true,
      preferenceId: result.id,
      initPoint: result.init_point || result.sandbox_init_point,
    });
  } catch (err) {
    console.error("MP createPreference error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.webhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type === "payment") {
      const paymentId = data?.id;
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
      });
      const payment = await response.json();
      const orderId = payment.external_reference;
      const status = payment.status;

      if (orderId && ["approved", "rejected", "cancelled", "pending"].includes(status)) {
        const map = { approved: "paid", rejected: "cancelled", cancelled: "cancelled", pending: "pending" };
        run("UPDATE store_orders SET status = ?, updated_at = datetime('now') WHERE id = ?", [map[status] || status, orderId]);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("MP webhook error:", err);
    res.sendStatus(200);
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
    });
    const payment = await response.json();
    res.json({ success: true, status: payment.status, status_detail: payment.status_detail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
