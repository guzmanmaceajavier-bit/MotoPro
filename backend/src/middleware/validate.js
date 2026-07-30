module.exports = function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    if (schema.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];
        if (rules.required && (value === undefined || value === null || value === "")) {
          errors.push(`${field} es requerido`);
        }
        if (value !== undefined && value !== null) {
          if (rules.type === "string" && typeof value !== "string") errors.push(`${field} debe ser texto`);
          if (rules.type === "number" && (typeof value !== "number" || isNaN(value))) errors.push(`${field} debe ser un número`);
          if (rules.type === "array" && !Array.isArray(value)) errors.push(`${field} debe ser un arreglo`);
          if (rules.minLength && value.length < rules.minLength) errors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
          if (rules.maxLength && value.length > rules.maxLength) errors.push(`${field} debe tener máximo ${rules.maxLength} caracteres`);
          if (rules.min !== undefined && value < rules.min) errors.push(`${field} debe ser mayor o igual a ${rules.min}`);
          if (rules.max !== undefined && value > rules.max) errors.push(`${field} debe ser menor o igual a ${rules.max}`);
          if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push(`${field} debe ser un email válido`);
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) errors.push(`${field} no tiene el formato correcto`);
          if (rules.oneOf && !rules.oneOf.includes(value)) errors.push(`${field} debe ser uno de: ${rules.oneOf.join(", ")}`);
        }
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: "Error de validación", errors });
    }
    next();
  };
};
