const express = require('express');
const cors = require('cors');
const {
  notFoundHandler,
  errorHandler,
} = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Kiểm tra trạng thái server
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Backend WEBQUANLYMUONSACH is running',
  });
});

// Xử lý 404 và lỗi tập trung
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;