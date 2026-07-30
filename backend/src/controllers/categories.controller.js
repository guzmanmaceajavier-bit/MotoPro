const CategoryRepository = require("../repositories/categories.repository");
const { destroyImage } = require("../utils/cloudinary");
const { success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  success(res, CategoryRepository.findAll());
};

exports.getById = (req, res) => {
  const cat = CategoryRepository.findById(req.params.id);
  if (!cat) return error(res, "Categoría no encontrada", 404);
  success(res, cat);
};

exports.getBySlug = (req, res) => {
  const cat = CategoryRepository.findBySlug(req.params.slug);
  if (!cat) return error(res, "Categoría no encontrada", 404);
  success(res, cat);
};

exports.create = (req, res) => {
  if (!req.body.name) return error(res, "Nombre requerido", 400);
  const id = CategoryRepository.create(req.body);
  success(res, { id }, "Categoría creada", 201);
};

exports.update = (req, res) => {
  const existing = CategoryRepository.findById(req.params.id);
  if (!existing) return error(res, "Categoría no encontrada", 404);
  CategoryRepository.update(req.params.id, req.body);
  success(res, null, "Categoría actualizada");
};

exports.remove = (req, res) => {
  const existing = CategoryRepository.findById(req.params.id);
  if (!existing) return error(res, "Categoría no encontrada", 404);
  if (existing.image) destroyImage(existing.image);
  CategoryRepository.delete(req.params.id);
  success(res, null, "Categoría eliminada");
};

exports.listSubcategories = (req, res) => {
  success(res, CategoryRepository.findSubcategories(req.params.categoryId));
};

exports.createSubcategory = (req, res) => {
  if (!req.body.name) return error(res, "Nombre requerido", 400);
  const id = CategoryRepository.createSubcategory(req.params.categoryId, req.body);
  success(res, { id }, "Subcategoría creada", 201);
};

exports.updateSubcategory = (req, res) => {
  CategoryRepository.updateSubcategory(req.params.id, req.body);
  success(res, null, "Subcategoría actualizada");
};

exports.removeSubcategory = (req, res) => {
  CategoryRepository.deleteSubcategory(req.params.id);
  success(res, null, "Subcategoría eliminada");
};
