const { ValidationError, AuthenticationError, AuthorizationError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({ message: err.message });
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json({ message: err.message });
  }

  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;