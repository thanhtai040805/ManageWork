const logger = require("../utils/logger");
const { Sentry } = require("../sentry");

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Capture error to Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  // Handle specific database errors
  if (err.code === "23505") {
    return res.status(409).json({
      status: "error",
      message: "Duplicate entry",
      error: "Resource already exists",
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      status: "error",
      message: "Foreign key constraint violation",
      error: "Referenced resource does not exist",
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
      error: "Token is malformed",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token expired",
      error: "Please login again",
    });
  }

  // Handle express-validator formatted errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: err.message || "Validation failed",
      errors: err.errors,
    });
  }

  // Handle UnauthorizedError (from express-jwt if used)
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized access",
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
