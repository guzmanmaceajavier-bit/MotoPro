function scopeByClient(req, res, next) {
  req.clientScope = req.user?.id ? { customer_id: req.user.id } : {};
  next();
}

function scopeByParent(parentField) {
  return (req, res, next) => {
    req.parentScope = { [parentField]: req.params.parentId };
    next();
  };
}

module.exports = { scopeByClient, scopeByParent };
