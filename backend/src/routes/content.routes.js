const router = require("express").Router();
const { wrapController } = require("../utils/helpers");
const { createCrudController } = require("../controllers/crud.factory");
const contentRepos = require("../repositories/content");
const cmsCtrl = wrapController(require("../controllers/cms.controller"));
const blogCtrl = wrapController(require("../controllers/blog.controller"));
const blogCommentsCtrl = wrapController(require("../controllers/blog-comments.controller"));
const heroCtrl = wrapController(require("../controllers/hero.controller"));
const configCtrl = wrapController(require("../controllers/config.controller"));
const legalCtrl = wrapController(require("../controllers/legal.controller"));
const mediaCtrl = wrapController(require("../controllers/media.controller"));
const galleryCtrl = wrapController(require("../controllers/gallery.controller"));
const upload = require("../middleware/upload");
const { verifyToken, requirePermission } = require("../middleware/auth");
const { cache } = require("../middleware/cache");

// ── CMS (custom handlers) ──
router.get("/cms/homepage", cache(300), cmsCtrl.getHomepage);
router.get("/cms/homepage/:sectionKey", cache(300), cmsCtrl.getHomepageSection);
router.put("/cms/homepage/:sectionKey", verifyToken, requirePermission("cms.homepage"), cmsCtrl.updateHomepageSection);
router.put("/cms/homepage/order/reorder", verifyToken, requirePermission("cms.homepage"), cmsCtrl.updateHomepageOrder);
router.get("/cms/navbar", cache(300), cmsCtrl.getNavbar);
router.post("/cms/navbar", verifyToken, requirePermission("cms.navbar"), cmsCtrl.saveNavbarItem);
router.put("/cms/navbar/:id", verifyToken, requirePermission("cms.navbar"), cmsCtrl.saveNavbarItem);
router.delete("/cms/navbar/:id", verifyToken, requirePermission("cms.navbar"), cmsCtrl.deleteNavbarItem);
router.get("/cms/footer", cache(300), cmsCtrl.getFooter);
router.post("/cms/footer", verifyToken, requirePermission("cms.footer"), cmsCtrl.saveFooterColumn);
router.put("/cms/footer/:id", verifyToken, requirePermission("cms.footer"), cmsCtrl.saveFooterColumn);
router.delete("/cms/footer/:id", verifyToken, requirePermission("cms.footer"), cmsCtrl.deleteFooterColumn);
router.get("/cms/seo", verifyToken, cmsCtrl.getAllSeoConfigs);
router.get("/cms/seo/:page", cmsCtrl.getSeoConfig);
router.put("/cms/seo/:page", verifyToken, requirePermission("cms.seo"), cmsCtrl.updateSeoConfig);

// ── Generic CRUD modules ──
function addCrudRoutes(base, repo, name, permission) {
  const ctrl = wrapController(createCrudController(repo, { name }));
  router.get(base, cache(300), ctrl.list);
  router.get(`${base}/:id`, cache(300), ctrl.getById);
  router.post(base, verifyToken, requirePermission(permission), ctrl.create);
  router.put(`${base}/:id`, verifyToken, requirePermission(permission), ctrl.update);
  router.delete(`${base}/:id`, verifyToken, requirePermission(permission.replace(".write", ".delete").replace(".upload", ".delete") || `${permission}`), ctrl.remove);
}

addCrudRoutes("/testimonials", contentRepos.testimonials, "Testimonio", "cms.homepage");
addCrudRoutes("/team", contentRepos.team, "Miembro", "cms.homepage");
addCrudRoutes("/values", contentRepos.values, "Valor", "cms.homepage");
addCrudRoutes("/garage-bays", contentRepos["garage-bays"], "Bahía", "cms.homepage");
addCrudRoutes("/process-steps", contentRepos["process-steps"], "Paso", "cms.homepage");
addCrudRoutes("/facilities", contentRepos.facilities, "Instalación", "cms.homepage");
addCrudRoutes("/certifications", contentRepos.certifications, "Certificación", "cms.homepage");
addCrudRoutes("/trust-items", contentRepos["trust-items"], "Item", "cms.homepage");
addCrudRoutes("/offers", contentRepos.offers, "Oferta", "coupons.write");
addCrudRoutes("/faqs", contentRepos.faqs, "FAQ", "cms.homepage");

// ── Blog ──
router.get("/blog", cache(300), blogCtrl.list);
router.get("/blog/id/:id", cache(300), blogCtrl.getById);
router.get("/blog/:slug", cache(300), blogCtrl.getBySlug);
router.post("/blog", verifyToken, requirePermission("blog.write"), blogCtrl.create);
router.put("/blog/:id", verifyToken, requirePermission("blog.write"), blogCtrl.update);
router.delete("/blog/:id", verifyToken, requirePermission("blog.delete"), blogCtrl.remove);

// Blog Comments
router.get("/blog-comments", cache(300), blogCommentsCtrl.list);
router.get("/blog-comments/:id", cache(300), blogCommentsCtrl.getById);
router.post("/blog-comments", blogCommentsCtrl.create);
router.put("/blog-comments/:id", verifyToken, requirePermission("blog.write"), blogCommentsCtrl.update);
router.delete("/blog-comments/:id", verifyToken, requirePermission("blog.write"), blogCommentsCtrl.remove);
router.put("/blog-comments/:id/approve", verifyToken, requirePermission("blog.write"), blogCommentsCtrl.approve);

// Blog Categories
addCrudRoutes("/blog-categories", contentRepos["blog-categories"], "Categoría", "blog.write");

// ── Before/After ──
const baCtrl = wrapController(createCrudController(contentRepos["before-after"], { name: "Antes/Después" }));
router.get("/before-after", cache(300), baCtrl.list);
router.get("/before-after/:id", cache(300), baCtrl.getById);
router.post("/before-after", verifyToken, requirePermission("media.upload"), baCtrl.create);
router.put("/before-after/:id", verifyToken, requirePermission("media.upload"), baCtrl.update);
router.delete("/before-after/:id", verifyToken, requirePermission("media.delete"), baCtrl.remove);

// ── Hero ──
router.get("/hero", cache(300), heroCtrl.list);
router.get("/hero/:id", cache(300), heroCtrl.getById);
router.post("/hero", verifyToken, requirePermission("cms.homepage"), heroCtrl.create);
router.post("/hero/upload", verifyToken, upload.single("image"), uploadCtrl.uploadImage);
router.put("/hero/:id", verifyToken, requirePermission("cms.homepage"), heroCtrl.update);
router.delete("/hero/:id", verifyToken, requirePermission("cms.homepage"), heroCtrl.remove);

// ── Gallery ──
router.get("/gallery", cache(300), galleryCtrl.list);
router.post("/gallery", verifyToken, upload.single("image"), galleryCtrl.create);
router.put("/gallery/:id", verifyToken, upload.single("image"), galleryCtrl.update);
router.delete("/gallery/:id", verifyToken, requirePermission("media.delete"), galleryCtrl.remove);

// ── Config ──
router.get("/config", cache(300), configCtrl.getAll);
router.get("/config/stats", verifyToken, requirePermission("settings.read"), configCtrl.stats);
router.put("/config", verifyToken, requirePermission("settings.write"), configCtrl.update);
router.post("/config/format", verifyToken, requirePermission("settings.write"), configCtrl.format);

// ── Legal ──
router.get("/legal", cache(300), legalCtrl.list);
router.get("/legal/slug/:slug", cache(300), legalCtrl.getBySlug);
router.get("/legal/:id", verifyToken, requirePermission("cms.homepage"), legalCtrl.getById);
router.post("/legal", verifyToken, requirePermission("cms.homepage"), legalCtrl.create);
router.put("/legal/:id", verifyToken, requirePermission("cms.homepage"), legalCtrl.update);
router.delete("/legal/:id", verifyToken, requirePermission("cms.homepage"), legalCtrl.remove);

// ── Media ──
router.get("/media", verifyToken, mediaCtrl.list);
router.get("/media/folders", verifyToken, mediaCtrl.getFolders);
router.get("/media/tags", verifyToken, mediaCtrl.getTags);
router.get("/media/trash", verifyToken, mediaCtrl.list);
router.get("/media/:id", verifyToken, mediaCtrl.getById);
router.get("/media/:id/usages", verifyToken, mediaCtrl.getUsages);
router.post("/media", verifyToken, requirePermission("media.upload"), upload.single("file"), mediaCtrl.create);
router.put("/media/:id", verifyToken, requirePermission("media.folders"), mediaCtrl.update);
router.post("/media/:id/trash", verifyToken, mediaCtrl.trash);
router.post("/media/:id/restore", verifyToken, mediaCtrl.restore);
router.delete("/media/:id", verifyToken, requirePermission("media.delete"), mediaCtrl.deletePermanent);
router.post("/media/trash/empty", verifyToken, requirePermission("media.delete"), mediaCtrl.emptyTrash);

module.exports = router;
