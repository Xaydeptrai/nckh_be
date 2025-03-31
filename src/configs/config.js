const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.USER_SERVICE_PORT,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};
