const AppError = require('./../utils/appError');

// Could make more complex such as severity levels on each error
// And to also email an administrator. But for a small scale app this is still good
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  //const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const value = err.keyValue.name;
  const message = `Duplicate field value: "${value}". Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  // Object.values are the enumerable objects we want to iterate
  // map will iterate over each, and we write the value.property to get each
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Payload manipulated
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, we trust this error as it wont leak any code errors
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // Unknown error, we do not want to leak any details to the client
  } else {
    // eslint-disable-next-line no-console
    console.error('ERROR', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  // Default status code as some errors may come here with no status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    //console.log(err);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name, message: err.message };

    // Handling mongoose errors
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }
    // If we find other DB / mongoose errors that we want to mark operational, we
    // should do similar to what we have done above here.

    sendErrorProd(error, res);
  }
};
