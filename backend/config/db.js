const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isUnresolved = (val) => !val || String(val).includes('${{');

// ─── Connection Strategy ──────────────────────────────────────────────────────
//
// Railway private networking (mysql.railway.internal) consistently causes
// ETIMEDOUT — the internal DNS isn't reliable across all Railway project configs.
//
// RELIABLE order:
//   1. MYSQL_PUBLIC_URL  → Railway TCP proxy (always externally reachable)
//   2. MYSQL_URL         → Railway private network (fallback)
//   3. Local DB_* vars   → local development
//
// NOTE: keepAlive is NOT a valid mysql2 dialectOption — removed to fix warning.
// ─────────────────────────────────────────────────────────────────────────────

const MYSQL_PUBLIC_URL = process.env.MYSQL_PUBLIC_URL;
const MYSQL_URL        = process.env.MYSQL_URL;

// Pick the best available Railway URL (prefer internal private network)
const railwayUrl =
  (MYSQL_URL        && !isUnresolved(MYSQL_URL))        ? MYSQL_URL        :
  (MYSQL_PUBLIC_URL && !isUnresolved(MYSQL_PUBLIC_URL)) ? MYSQL_PUBLIC_URL :
  null;

const isRailway = !!railwayUrl;

let sequelize;

if (isRailway) {
  // ── Railway Production (Private Network or TCP Proxy) ─────────────────────
  const urlType = railwayUrl === MYSQL_URL
    ? 'MYSQL_URL (Private Network ✅)'
    : 'MYSQL_PUBLIC_URL (TCP Proxy Fallback)';

  console.log(`🚀 Railway Production — using ${urlType}`);

  sequelize = new Sequelize(railwayUrl, {
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000,   // 60s — covers Railway cold starts
      enableKeepAlive: true,   // Enable TCP keep-alive
      keepAliveDelay: 10000,   // Check connection health every 10s
    },
    pool: {
      max:     5,
      min:     0,              // Allow pool to drain fully when idle
      acquire: 60000,
      idle:    10000,          // Drop connection if idle for 10s
      evict:   5000,           // Check for idle connections to evict every 5s
    },
    logging: false,
  });

} else {
  // ── Local Development ─────────────────────────────────────────────────────
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
