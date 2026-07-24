const router = require("express").Router();
const cmsCtrl = require("../controllers/cms.controller");
const blogCtrl = require("../controllers/blog.controller");
const blogCategoriesCtrl = require("../controllers/blog-categories.controller");
const galleryCtrl = require("../controllers/gallery.controller");
const testimonialsCtrl = require("../controllers/testimonials.controller");
const beforeAfterCtrl = require("../controllers/before-after.controller");
const teamCtrl = require("../controllers/team.controller");
const heroCtrl = require("../controllers/hero.controller");
const configCtrl = require("../controllers/config.controller");
const legalCtrl = require("../controllers/legal.controller");
const mediaCtrl = require("../controllers/media.controller");
const valuesCtrl = require("../controllers/values.controller");
const uploadCtrl = require("../controllers/upload.controller");
const upload = require("../middleware/upload");
const { verifyToken, requirePermission } = require("../middleware/auth");

router.get("/cms/homepage", cmsCtrl.getHomepage);
router.get("/cms/homepage/:sectionKey", cmsCtrl.getHomepageSection);
router.put("/cms/homepage/:sectionKey", verifyToken, requirePermission("cms.homepage"), cmsCtrl.updateHomepageSection);
router.put("/cms/homepage/order/reorder", verifyToken, requirePermission("cms.homepage"), cmsCtrl.updateHomepageOrder);
router.get("/cms/navbar", cmsCtrl.getNavbar);
router.post("/cms/navbar", verifyToken, requirePermission("cms.navbar"), cmsCtrl.saveNavbarItem);
router.put("/cms/navbar/:id", verifyToken, requirePermission("cms.navbar"), cmsCtrl.saveNavbarItem);
router.delete("/cms/navbar/:id", verifyToken, requirePermission("cms.navbar"), cmsCtrl.deleteNavbarItem);
router.get("/cms/footer", cmsCtrl.getFooter);
router.post("/cms/footer", verifyToken, requirePermission("cms.footer"), cmsCtrl.saveFooterColumn);
router.put("/cms/footer/:id", verifyToken, requirePermission("cms.footer"), cmsCtrl.saveFooterColumn);
router.delete("/cms/footer/:id", verifyToken, requirePermission("cms.footer"), cmsCtrl.deleteFooterColumn);
router.get("/cms/seo", verifyToken, cmsCtrl.getAllSeoConfigs);
router.get("/cms/seo/:page", cmsCtrl.getSeoConfig);
router.put("/cms/seo/:page", verifyToken, requirePermission("cms.seo"), cmsCtrl.updateSeoConfig);

router.get("/blog", blogCtrl.list);
router.get("/blog/id/:id", blogCtrl.getById);
router.get("/blog/:slug", blogCtrl.getBySlug);
router.post("/blog", verifyToken, requirePermission("blog.write"), blogCtrl.create);
router.put("/blog/:id", verifyToken, requirePermission("blog.write"), blogCtrl.update);
router.delete("/blog/:id", verifyToken, requirePermission("blog.delete"), blogCtrl.remove);

router.get("/blog-categories", blogCategoriesCtrl.list);
router.get("/blog-categories/:id", blogCategoriesCtrl.getById);
router.post("/blog-categories", verifyToken, requirePermission("blog.write"), blogCategoriesCtrl.create);
router.put("/blog-categories/:id", verifyToken, requirePermission("blog.write"), blogCategoriesCtrl.update);
router.delete("/blog-categories/:id", verifyToken, requirePermission("blog.delete"), blogCategoriesCtrl.remove);

router.get("/gallery", galleryCtrl.list);
router.post("/gallery", verifyToken, upload.single("image"), galleryCtrl.create);
router.put("/gallery/:id", verifyToken, upload.single("image"), galleryCtrl.update);
router.delete("/gallery/:id", verifyToken, requirePermission("media.delete"), galleryCtrl.remove);

router.get("/testimonials", testimonialsCtrl.list);
router.get("/testimonials/:id", testimonialsCtrl.getById);
router.post("/testimonials", verifyToken, requirePermission("cms.homepage"), testimonialsCtrl.create);
router.put("/testimonials/:id", verifyToken, requirePermission("cms.homepage"), testimonialsCtrl.update);
router.delete("/testimonials/:id", verifyToken, requirePermission("cms.homepage"), testimonialsCtrl.remove);

router.get("/before-after", beforeAfterCtrl.list);
router.get("/before-after/:id", beforeAfterCtrl.getById);
router.post("/before-after", verifyToken, requirePermission("media.upload"), beforeAfterCtrl.create);
router.put("/before-after/:id", verifyToken, requirePermission("media.upload"), beforeAfterCtrl.update);
router.delete("/before-after/:id", verifyToken, requirePermission("media.delete"), beforeAfterCtrl.remove);

router.get("/team", teamCtrl.list);
router.get("/team/:id", teamCtrl.getById);
router.post("/team", verifyToken, requirePermission("cms.homepage"), teamCtrl.create);
router.put("/team/:id", verifyToken, requirePermission("cms.homepage"), teamCtrl.update);
router.delete("/team/:id", verifyToken, requirePermission("cms.homepage"), teamCtrl.remove);

router.get("/hero", heroCtrl.list);
router.get("/hero/:id", heroCtrl.getById);
router.post("/hero", verifyToken, requirePermission("cms.homepage"), heroCtrl.create);
router.post("/hero/upload", verifyToken, upload.single("image"), uploadCtrl.uploadImage);
router.put("/hero/:id", verifyToken, requirePermission("cms.homepage"), heroCtrl.update);
router.delete("/hero/:id", verifyToken, requirePermission("cms.homepage"), heroCtrl.remove);

router.get("/config", configCtrl.getAll);
router.get("/config/stats", verifyToken, requirePermission("settings.read"), configCtrl.stats);
router.put("/config", verifyToken, requirePermission("settings.write"), configCtrl.update);
router.post("/config/format", verifyToken, requirePermission("settings.write"), configCtrl.format);

router.get("/values", valuesCtrl.list);
router.get("/values/:id", valuesCtrl.getById);
router.post("/values", verifyToken, requirePermission("cms.homepage"), valuesCtrl.create);
router.put("/values/:id", verifyToken, requirePermission("cms.homepage"), valuesCtrl.update);
router.delete("/values/:id", verifyToken, requirePermission("cms.homepage"), valuesCtrl.remove);

router.get("/legal", legalCtrl.list);
router.get("/legal/slug/:slug", legalCtrl.getBySlug);
router.get("/legal/:id", verifyToken, requirePermission("cms.homepage"), legalCtrl.getById);
router.post("/legal", verifyToken, requirePermission("cms.homepage"), legalCtrl.create);
router.put("/legal/:id", verifyToken, requirePermission("cms.homepage"), legalCtrl.update);
router.delete("/legal/:id", verifyToken, requirePermission("cms.homepage"), legalCtrl.remove);

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
