const AppError = require('../utils/AppError');

/**
 * Middleware bat loi 404 khi route khong ton tai
 */
const notFoundHandler = (req, res, next) => {
  next(
    new AppError(
      `Khong tim thay duong dan API: ${req.method} ${req.originalUrl}`,
      404,
      'KHONG_TIM_THAY_ENDPOINT'
    )
  );
};

/**
 * Middleware xu ly loi tap trung toan he thong
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'LOI_HE_THONG';
  let message = err.message || 'Da xay ra loi tren he thong';
  let details = err.details || null;

  // 1. Loi Duplicate Key cua MongoDB (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DU_LIEU_BI_TRUNG';
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    const fieldName = fields.length > 0 ? fields.join(', ') : 'truong du lieu';
    message = `Gia tri cua '${fieldName}' da ton tai trong he thong`;
    details = err.keyValue || null;
  }

  // 2. Loi Validation cua Mongoose
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'DU_LIEU_KHONG_HOP_LE';
    const errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    message = errors[0]?.message || 'Du lieu dau vao khong hop le';
    details = errors;
  }

  // 3. Loi CastError (ObjectId khong hop le)
  else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'DINH_DANG_ID_KHONG_HOP_LE';
    message = `Gia tri '${err.value}' khong hop le cho truong '${err.path}'`;
  }

  // 4. Loi MongoDB Document Validation ($jsonSchema)
  else if (err.code === 121) {
    statusCode = 400;
    errorCode = 'VI_PHAM_SCHEMA_CSDL';
    message = 'Du lieu khong thoa man rang buoc schema cua co so du lieu';
    details = err.errInfo?.details || null;
  }

  // 5. Loi JWT
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'TOKEN_KHONG_HOP_LE';
    message = 'Token xac thuc khong hop le';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_HET_HAN';
    message = 'Phien dang nhap da het han, vui long dang nhap lai';
  }

  if (statusCode === 500) {
    console.error('[ERROR 500]:', err);
  }

  return res.status(statusCode).json({
    success: false,
    errorCode,
    message,
    ...(details ? { details } : {}),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
