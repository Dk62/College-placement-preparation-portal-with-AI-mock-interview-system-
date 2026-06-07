const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isUnresolved = (val) => !val || String(val).includes('${{');

// ─── Pick connection strategy ─────────────────────────────────────────────────
// Railway injects individual MYSQL* vars AND a MYSQL_URL string.
// Individual vars (MYSQLHOST, MYSQLPORT, etc.) are MORE reliable than the URL
// because the URL goes through a TCP proxy that can drop long-running connections.
//
// Priority:
//   1. Individual Railway MYSQL* vars   → most stable on Railway private network
//   2. MYSQL_URL connection string       → fallback if individual vars not set
//   3. Local DB_* vars                  → local development only

const MYSQLHOST     = process.env.MYSQLHOST;
const MYSQLPORT     = process.env.MYSQLPORT;
const MYSQLUSER     = process.env.MYSQLUSER;
const MYSQLPASSWORD = process.env.MYSQLPASSWORD;
const MYSQLDATABASE = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE;
const MYSQL_URL     = process.env.MYSQL_URL;

const hasIndividualVars =
  !isUnresolved(MYSQLHOST) &&
  !isUnresolved(MYSQLUSER) &&
  !isUnresolved(MYSQLPASSWORD) &&
  !isUnresolved(MYSQLDATABASE);

const hasUrlConnection = MYSQL_URL && !isUnresolved(MYSQL_URL);

let sequelize;

if (hasIndividualVars) {
  // ── Strategy 1: Railway individual vars (most reliable) ───────────────────
  const host = MYSQLHOST;
  const port = parseInt(MYSQLPORT) || 3306;
  const user = MYSQLUSER;
  const pass = MYSQLPASSWORD;
  const db   = MYSQLDATABASE;

  console.log(`🚀 Railway Production: ${user}@${host}:${port}/${db}`);

  sequelize = new Sequelize(db, user, pass, {
    host,
    port,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000,
      // keepAlive prevents "Connection lost" during long sync operations
      keepAlive: true,
    },
    pool: {
      max: 5,
      min: 1,
      acquire: 60000,
      idle:    20000,
      evict:   30000,
    },
    logging: false,
  });

} else if (hasUrlConnection) {
  // ── Strategy 2: MYSQL_URL connection string ────────────────────────────────
  console.log('🚀 Railway Production: connecting via MYSQL_URL');

  sequelize = new Sequelize(MYSQL_URL, {
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000,
      keepAlive:      true,
    },
    pool: {
      max: 5,
      min: 1,
      acquire: 60000,
      idle:    20000,
    },
    logging: false,
  });

} else {
  // ── Strategy 3: Local development ─────────────────────────────────────────
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'placement_portal';
  const dbPort = parseInt(process.env.DB_PORT) || 3306;

  console.log(`💻 Local Dev: ${dbUser}@${dbHost}:${dbPort}/${dbName}`);

  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
  });
}

module.exports = sequelize;
