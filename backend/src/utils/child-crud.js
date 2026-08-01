const { success, error } = require("./helpers");

function createChildCrudController(repo, { parentField, name } = {}) {
  const entity = name || "Item";
  return {
    list: (req, res) => {
      const filter = { [parentField]: req.params.parentId };
      success(res, repo.findByParent(filter));
    },
    getById: (req, res) => {
      const item = repo.findById(req.params.id);
      if (!item) return error(res, `${entity} no encontrado`, 404);
      success(res, item);
    },
    create: (req, res) => {
      const data = { ...req.body, [parentField]: req.params.parentId };
      const id = repo.create(data);
      success(res, { id }, `${entity} creado`, 201);
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

function addChildCrudRoutes(router, base, repo, parentField, { name, verifyToken, requirePermission, cache, permission } = {}) {
  const ctrl = require("./helpers").wrapController(createChildCrudController(repo, { parentField, name }));
  const auth = verifyToken ? [verifyToken] : [];
  if (requirePermission && permission) auth.push(requirePermission(permission));
  const cacheMw = cache ? cache(300) : (req, res, next) => next();

  router.get(base, cacheMw, ctrl.list);
  router.get(`${base}/:id`, cacheMw, ctrl.getById);
  router.post(base, ...auth, ctrl.create);
  router.put(`${base}/:id`, ...auth, ctrl.update);
  router.delete(`${base}/:id`, ...auth, ctrl.remove);
}

module.exports = { createChildCrudController, addChildCrudRoutes };
