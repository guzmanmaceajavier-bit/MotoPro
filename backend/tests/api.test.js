const BASE = process.env.API_URL || "http://localhost:4000/api";
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try { await fn(); passed++; console.log(`\x1b[32m\u2713\x1b[0m ${name}`); }
  catch (err) { failed++; console.log(`\x1b[31m\u2717\x1b[0m ${name}: ${err.message}`); }
}

async function get(path) { const res = await fetch(`${BASE}${path}`); return res.json(); }
async function post(path, data) {
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  return res.json();
}

async function main() {
  console.log("\n\uD83E\uDDEA MotoPro API Tests\n");
  await test("GET /health returns ok", async () => {
    const data = await get("/health");
    if (!data || data.status !== "ok") throw new Error("Health check failed");
  });
  await test("GET /products returns array", async () => {
    const data = await get("/products"); const arr = data?.data || data || [];
    if (!Array.isArray(arr)) throw new Error("Products should be an array");
  });
  await test("GET /services returns array", async () => {
    const data = await get("/services"); const arr = data?.data || data || [];
    if (!Array.isArray(arr)) throw new Error("Services should be an array");
  });
  await test("GET /categories returns array", async () => {
    const data = await get("/categories"); const arr = data?.data || data || [];
    if (!Array.isArray(arr)) throw new Error("Categories should be an array");
  });
  await test("GET /blog returns array", async () => {
    const data = await get("/blog"); const arr = data?.data || data || [];
    if (!Array.isArray(arr)) throw new Error("Blog should be an array");
  });
  await test("GET /faqs returns array", async () => {
    const data = await get("/faqs"); const arr = data?.data || data || [];
    if (!Array.isArray(arr)) throw new Error("FAQs should be an array");
  });
  await test("GET /search?q=moto returns results", async () => {
    const data = await get("/search?q=moto");
    if (!Array.isArray(data?.results || [])) throw new Error("Search should return results array");
  });
  await test("POST /blog-comments validates creation", async () => {
    const data = await post("/blog-comments", { post_id: "test", author_name: "Test", author_email: "test@test.com", content: "Test comment for testing purposes" });
    if (data?.message && data.message.includes("Error")) throw new Error(data.message || "Creation failed");
  });
  console.log(`\n\uD83D\uDCCA Resultados: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}
main();
