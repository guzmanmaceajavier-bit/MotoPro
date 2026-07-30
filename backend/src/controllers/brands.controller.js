const BrandRepository = require("../repositories/brands.repository");
const { destroyImage } = require("../utils/cloudinary");
const { success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  const showAll = req.query.all === "1" || req.query.all === "true";
  success(res, BrandRepository.findAll(showAll));
};

exports.getById = (req, res) => {
  const brand = BrandRepository.findById(req.params.id);
  if (!brand) return error(res, "Marca no encontrada", 404);
  success(res, brand);
};

exports.create = (req, res) => {
  if (!req.body.name) return error(res, "Nombre requerido", 400);
  const id = BrandRepository.create(req.body);
  success(res, { id }, "Marca creada", 201);
};

exports.update = (req, res) => {
  const existing = BrandRepository.findById(req.params.id);
  if (!existing) return error(res, "Marca no encontrada", 404);
  if (req.body.image && req.body.image !== existing.image) destroyImage(existing.image);
  BrandRepository.update(req.params.id, req.body);
  success(res, null, "Marca actualizada");
};

exports.remove = (req, res) => {
  const existing = BrandRepository.findById(req.params.id);
  if (!existing) return error(res, "Marca no encontrada", 404);
  if (existing.image) destroyImage(existing.image);
  BrandRepository.delete(req.params.id);
  success(res, null, "Marca eliminada");
};
