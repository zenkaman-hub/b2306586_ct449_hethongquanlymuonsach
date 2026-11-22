/**
 * Lop loi nghiep vu tuy chinh dung cho xu ly loi tap trung
 */
class AppError extends Error {
  /**
   * @param {string} message - Thong bao loi hien thi cho nguoi dung
   * @param {number} statusCode - Ma HTTP status (400, 401, 403, 404, 409, 500...)
   * @param {string} errorCode - Ma loi nghiep vu (VD: TAI_KHOAN_BI_KHOA, DU_LIEU_KHONG_HOP_LE)
   * @param {any} details - Chi tiet loi bo sung (neu co)
   */
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
