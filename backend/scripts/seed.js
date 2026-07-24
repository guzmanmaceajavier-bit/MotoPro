const { initDatabase, getDb, query, get, run } = require("../src/config/database");
const { generateId } = require("../src/utils/helpers");
const bcrypt = require("bcryptjs");

async function seed() {
  await initDatabase();

  const existingProducts = get("SELECT COUNT(*) as c FROM products");
  if (existingProducts && existingProducts.c > 0) {
    console.log("Base de datos ya contiene datos. Omitiendo seed.");
    return;
  }

  console.log("Sembrando datos de demostración...");

  const hashedPassword = bcrypt.hashSync("admin123", 10);
  run("INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
    ["user-admin-001", "Admin", "admin@motopro.com", hashedPassword, "superadmin"]);

  const catAceites = generateId();
  const catCascos = generateId();
  const catAccesorios = generateId();
  const catRespuestos = generateId();

  run("INSERT INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)", [catAceites, "Aceites y Lubricantes", "aceites", 1]);
  run("INSERT INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)", [catCascos, "Cascos", "cascos", 2]);
  run("INSERT INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)", [catAccesorios, "Accesorios", "accesorios", 3]);
  run("INSERT INTO categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)", [catRespuestos, "Respuestos", "respuestos", 4]);

  const brands = [
    ["honda", "Honda"], ["yamaha", "Yamaha"], ["suzuki", "Suzuki"],
    ["kawasaki", "Kawasaki"], ["bmw", "BMW"]
  ];
  for (const [slug, name] of brands) {
    run("INSERT INTO brands (id, name, sort_order) VALUES (?, ?, ?)", [generateId(), name, 1]);
  }

  const products = [
    { name: "Aceite 20W50", slug: "aceite-20w50", cat: catAceites, price: 12.99, stock: 50 },
    { name: "Aceite 10W40", slug: "aceite-10w40", cat: catAceites, price: 10.99, stock: 45 },
    { name: "Casco Integral", slug: "casco-integral", cat: catCascos, price: 89.99, stock: 15 },
    { name: "Casco Abierto", slug: "casco-abierto", cat: catCascos, price: 59.99, stock: 20 },
    { name: "Kit de Arrastre", slug: "kit-arrastre", cat: catRespuestos, price: 45.00, stock: 10 },
    { name: "Pastillas de Freno", slug: "pastillas-freno", cat: catRespuestos, price: 25.00, stock: 30 },
    { name: "Guantes de Protección", slug: "guantes-proteccion", cat: catAccesorios, price: 35.00, stock: 25 },
    { name: "Candado de Seguridad", slug: "candado-seguridad", cat: catAccesorios, price: 18.00, stock: 40 },
    { name: "Lubricante Cadena", slug: "lubricante-cadena", cat: catAceites, price: 8.50, stock: 60 },
    { name: "Filtro de Aceite", slug: "filtro-aceite", cat: catRespuestos, price: 7.50, stock: 35 },
  ];

  for (const p of products) {
    run(
      "INSERT INTO products (id, name, slug, category_id, price, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
      [generateId(), p.name, p.slug, p.cat, p.price, p.stock]
    );
  }

  const services = [
    { title: "Cambio de Aceite", slug: "cambio-aceite", price: 25.00 },
    { title: "Afinación General", slug: "afinacion-general", price: 80.00 },
    { title: "Revisión de Frenos", slug: "revision-frenos", price: 35.00 },
    { title: "Cambio de Llantas", slug: "cambio-llantas", price: 20.00 },
    { title: "Diagnóstico Computarizado", slug: "diagnostico-computarizado", price: 40.00 },
  ];

  for (const s of services) {
    run("INSERT INTO services (id, title, slug, price, is_active) VALUES (?, ?, ?, ?, 1)",
      [generateId(), s.title, s.slug, s.price]);
  }

  console.log("Seed completado.");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
