import multer from "multer";

export default function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res
      .status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400)
      .json({
        success: false,
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "Uploaded file exceeds the 1 MB limit"
            : "Invalid upload"
      });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with that email already exists"
    });
  }

  const status = err.statusCode || err.status || 500;

  res.status(status).json({
    success: false,
    message:
      status >= 500
        ? "Server error. Please try again."
        : err.message || "Request failed"
  });
}
