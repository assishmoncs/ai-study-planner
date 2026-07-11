const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.entries(value).reduce((acc, [key, nestedValue]) => {
      if (key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor')
        return acc;
      acc[key] = sanitizeValue(nestedValue);
      return acc;
    }, {});
  }

  return value;
};

const sanitizeRequest = (req, _res, next) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
};

module.exports = sanitizeRequest;
