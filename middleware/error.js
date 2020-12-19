const ErrorResponse = require("../utils/errorResponse");

const error = (err, req, res, next) => {
  let error = err;
  console.log(err);

  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors);
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 11000) {
    const message = `Resource already registered`;
    error = new ErrorResponse(message, 404);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server Down" });
};

module.exports = error;
