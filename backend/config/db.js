const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// ─── Railway Production vs Local Dev Detection ────────────────────────────────
// Railway automatically injects MYSQL_URL as a full connection string.
// On local dev, we use individual DB_* vars from .env.
// We also guard against Railway's ${{...}} template strings being read literally
// (this happens when the .env file is deployed to Railway directly).

const isRailwayUnresolved = (val) => !val || val.includes('${{');

// Railway injects both MYSQL_URL (private network) and MYSQL_PUBLIC_URL (TCP proxy).
// We prefer MYSQL_PUBLIC_URL — it uses the Railway TCP proxy and is always reachable.
// MYSQL_URL uses the internal private domain which can sometimes have routing delays.
const MYSQL_PUBLIC_URL = process.env.MYSQL_PUBLIC_URL;
const MYSQL_URL        = process.env.MYSQL_URL;

const resolvedUrl =
  (MYSQL_PUBLIC_URL && !isRailwayUnresolved(MYSQL_PUBLIC_URL)) ? MYSQL_PUBLIC_URL :
  (MYSQL_URL        && !isRailwayUnresolved(MYSQL_URL))        ? MYSQL_URL        :
  null;

const hasValidMysqlUrl = !!resolvedUrl;

let sequelize;

if (hasValidMysqlUrl) {
  // ── Production (Railway): use full connection string ──────────────────────
  // Railway's MySQL runs on a private internal network — NO SSL needed.
  const urlType = resolvedUrl === MYSQL_PUBLIC_URL ? 'MYSQL_PUBLIC_URL (TCP Proxy)' : 'MYSQL_URL (Private Network)';
  console.log(`🚀 Production mode: connecting via ${urlType}`);

  sequelize = new Sequelize(resolvedUrl, {
    dialect: 'mysql',
    dialectOptions: {
      // NO ssl — Railway internal MySQL is plain TCP, not SSL.
      connectTimeout: 60000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
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

