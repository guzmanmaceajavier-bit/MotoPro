const cmsService = require('../services/cms.service');
const { success, error } = require('../utils/helpers');

exports.getHomepage = (req, res) => {
  const sections = cmsService.getHomepageSections();
  success(res, sections);
};

exports.getHomepageSection = (req, res) => {
  const { sectionKey } = req.params;
  const sections = cmsService.getHomepageSections();
  const section = sections.find(s => s.section_key === sectionKey);
  if (!section) return error(res, 'Sección no encontrada', 404);
  success(res, section);
};

exports.updateHomepageSection = (req, res) => {
  const { sectionKey } = req.params;
  const section = cmsService.upsertHomepageSection(sectionKey, req.body);
  success(res, section, 'Sección actualizada');
};

exports.updateHomepageOrder = (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return error(res, 'Se requiere un array de items', 400);
  cmsService.updateHomepageOrder(items);
  success(res, null, 'Orden actualizado');
};

exports.getNavbar = (req, res) => {
  const items = cmsService.getNavbarItems();
  success(res, items);
};

exports.saveNavbarItem = (req, res) => {
  const item = cmsService.upsertNavbarItem(req.body);
  success(res, item, req.body.id ? 'Item actualizado' : 'Item creado');
};

exports.deleteNavbarItem = (req, res) => {
  cmsService.deleteNavbarItem(req.params.id);
  success(res, null, 'Item eliminado');
};

exports.getFooter = (req, res) => {
  const columns = cmsService.getFooterColumns();
  success(res, columns);
};

exports.saveFooterColumn = (req, res) => {
  const column = cmsService.upsertFooterColumn(req.body);
  success(res, column, req.body.id ? 'Columna actualizada' : 'Columna creada');
};

exports.deleteFooterColumn = (req, res) => {
  cmsService.deleteFooterColumn(req.params.id);
  success(res, null, 'Columna eliminada');
};

exports.getSeoConfig = (req, res) => {
  const config = cmsService.getSeoConfig(req.params.page);
  success(res, config || { page: req.params.page });
};

exports.getAllSeoConfigs = (req, res) => {
  const configs = cmsService.getAllSeoConfigs();
  success(res, configs);
};

exports.updateSeoConfig = (req, res) => {
  const config = cmsService.upsertSeoConfig(req.params.page, req.body);
  success(res, config, 'SEO actualizado');
};
