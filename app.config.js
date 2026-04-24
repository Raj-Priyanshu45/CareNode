require('dotenv').config();
module.exports = ({ config }) => ({
  ...config,
  extra: {
    BASE_URL: process.env.BASE_URL || 'http://10.255.255.254:8080/api',
    AI_BASE_URL: process.env.AI_BASE_URL || 'http://10.255.255.254:8000',
    eas: {
      projectId: "f66f536e-36f1-4529-8dbe-186c1099fc16"
    }
  },
});
