require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/eatms',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  SMS_API_KEY: process.env.SMS_API_KEY,
  PAYMENT_API_KEY: process.env.PAYMENT_API_KEY,
  QR_CODE_SIZE: process.env.QR_CODE_SIZE || 256,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

module.exports = env;
