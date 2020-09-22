const consola = require('consola');
const deepcopy = require('deepcopy');
const mongoose = require('mongoose');

const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const msg = `Invalid ${err.path}: ${err.value}`;
  return new AppError(msg, 400);
};

const handleDuplicateFieldsDB = (err) => {
  let msg = '';

  for (const [key, value] of Object.entries(err.keyValue)) {
    msg += `Duplicate field value '${value}' for unique field '${key}'. `;
  }
  return new AppError(msg, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const msg = `Invalid input data:  ${errors.join('. ')}`;
  return new AppError(msg, 400);
};

const handleJWTError = () => new AppError('Invalid token', 401);
const handleJWTExpiredError = () => new AppError('Token has expired', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational = trusted error: Send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 1) Log error
    consola.error(err);
    // 2) Send generic response
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = deepcopy(err);
    if (err instanceof mongoose.Error.CastError)
      error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err instanceof mongoose.Error.ValidationError)
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
