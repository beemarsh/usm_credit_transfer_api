// Database Config
DB_NAME = process.env.DB_NAME;
DB_USER = process.env.DB_USER;
DB_PASSWORD = process.env.DB_PASSWORD;
DB_HOST = process.env.DB_HOST;
DB_PORT = process.env.DB_PORT;
const DB_URL = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;


const pgp = require('pg-promise')({
  // Initialization Options
});

// Creating a new database instance from the connection details:
const db = pgp(DB_URL);

module.exports = db;
