const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// ─── Railway Production vs Local Dev Detection ────────────────────────────────
// Railway automatically injects MYSQL_URL as a full connection string.
// On local dev, we use individual DB_* vars from .env.
// We also guard against Railway's ${{...}} template strings being read literally
// (this happens when the .env file is deployed to Railway directly).

const isRailwayUnresolved = (val) => !val || val.includes('${{');

const MYSQL_URL = process.env.MYSQL_URL;
const hasValidMysqlUrl = MYSQL_URL && !isRailwayUnresolved(MYSQL_URL);

let sequelize;

if (hasValidMysqlUrl) {
  // ── Production (Railway): use full connection string ──────────────────────
  console.log('🚀 Using MYSQL_URL connection string (Railway Production)');
  sequelize = new Sequelize(MYSQL_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false  // Required for Railway managed MySQL
      },
      connectTimeout: 30000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  });
} else {
  // ── Local Development: use individual DB_* variables ─────────────────────
  const dbHost     = process.env.DB_HOST || 'localhost';
  const dbUser     = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName     = process.env.DB_NAME || 'placement_portal';
  const dbPort     = parseInt(process.env.DB_PORT) || 3306;

  console.log(`💻 Using local DB: ${dbUser}@${dbHost}:${dbPort}/${dbName}`);

  if (!dbHost || !dbUser || !dbName) {
    console.error('❌ Missing database configuration! Set DB_HOST, DB_USER, DB_NAME in .env');
    process.exit(1);
  }

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
  });
}

module.exports = sequelize;

