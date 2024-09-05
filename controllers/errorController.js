const AppError = require('../utils/appError');
const handleCasteErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    const key = Object.keys(err.keyValue).join('');
    const message = `The key '${key}' has duplicate value of '${err.keyValue[key]}'`;
    return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const handleJWTError = (err) =>
    new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = (err) =>
    new AppError('Your token has expired! Please log in again.', 401);
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err, name: err.name };
        if (error.name === 'CastError') {
            error = handleCasteErrorDB(error, res);
        }
        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error, res);
        }
        if (error.name === 'ValidatorError') {
            error = handleValidationErrorDB(error, res);
        }
        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError(error, res);
        }
        if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError(error, res);
        }
        sendErrorProd(error, res);
    }
};
