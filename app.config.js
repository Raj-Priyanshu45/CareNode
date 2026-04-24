require('dotenv').config();

module.exports = ({ config }) => ({
  ...config,
  extra: {
    BASE_URL: process.env.BASE_URL || 'http://10.255.255.254:8080/api',
    AI_BASE_URL: process.env.AI_BASE_URL || 'http://10.255.255.254:8000',
  },
});
