const ServiceRepository = require("../repositories/services.repository");
const { success, error } = require("../utils/helpers");

exports.list = (req, res) => {
  success(res, ServiceRepository.findAll(req.query));
};

exports.getById = (req, res) => {
  const service = ServiceRepository.findById(req.params.id);
  if (!service) return error(res, "Servicio no encontrado", 404);
  success(res, service);
};

exports.create = (req, res) => {
  if (!req.body.title) return error(res, "Título requerido", 400);
  const id = ServiceRepository.create(req.body);
  success(res, { id }, "Servicio creado", 201);
};

exports.update = (req, res) => {
  const existing = ServiceRepository.findById(req.params.id);
  if (!existing) return error(res, "Servicio no encontrado", 404);
  ServiceRepository.update(req.params.id, req.body);
  success(res, null, "Servicio actualizado");
};

exports.remove = (req, res) => {
  const existing = ServiceRepository.findById(req.params.id);
  if (!existing) return error(res, "Servicio no encontrado", 404);
  ServiceRepository.delete(req.params.id);
  success(res, null, "Servicio eliminado");
};
