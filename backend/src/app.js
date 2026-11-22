const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Route kiểm tra server sống
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend WEBQUANLYMUONSACH is running' });
});

module.exports = app;