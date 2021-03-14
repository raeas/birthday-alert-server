module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgresql://postgres@localhost/birthday-alert',
  TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://postgres@localhost/birthday-alert-test',
  API_TOKEN: process.env.API_TOKEN || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000' 
}