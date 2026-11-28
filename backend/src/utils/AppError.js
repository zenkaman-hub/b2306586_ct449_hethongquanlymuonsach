// Lớp lỗi nghiệp vụ tùy chỉnh dùng cho middleware xử lý lỗi tập trung
class AppError extends Error {
  constructor(message, statusCode = 400, errorCode = 'LOI_NGHIEP_VU', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
