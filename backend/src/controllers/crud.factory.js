const { success, error } = require("../utils/helpers");

function createCrudController(repo, { name, listAuth } = {}) {
  const entity = name || "Registro";

  return {
    list: (req, res) => {
      const showAll = req.query.all === "1" || req.query.all === "true";
      success(res, repo.findAll(showAll));
    },

    getById: (req, res) => {
      const item = repo.findById(req.params.id);
      if (!item) return error(res, `${entity} no encontrado`, 404);
      success(res, item);
    },

    create: (req, res) => {
      const item = repo.create(req.body);
      success(res, { id: item }, `${entity} creado`, 201);
    },

    update: (req, res) => {
      const existing = repo.findById(req.params.id);
      if (!existing) return error(res, `${entity} no encontrado`, 404);
      repo.update(req.params.id, req.body);
      success(res, null, `${entity} actualizado`);
    },

    remove: (req, res) => {
      const existing = repo.findById(req.params.id);
      if (!existing) return error(res, `${entity} no encontrado`, 404);
      repo.remove(req.params.id);
      success(res, null, `${entity} eliminado`);
    },
  };
}

module.exports = { createCrudController };
