const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
      error: "Token is malformed",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
      error: "Please login again",
    });
  }

  // Database errors
  if (err.code === "23505") {
    return res.status(409).json({
      message: "Duplicate entry",
      error: "Resource already exists",
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      message: "Foreign key constraint violation",
      error: "Referenced resource does not exist",
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      error: err.message,
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;

