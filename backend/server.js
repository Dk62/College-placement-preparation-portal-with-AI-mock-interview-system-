const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server / mobile / curl with no origin header
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,           // Set this in Railway dashboard to your Vercel URL
    ].filter(Boolean);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||   // Any Vercel preview/production deploy
      origin.endsWith('.up.railway.app'); // Any Railway frontend deploy

    if (isAllowed) return callback(null, true);

    console.warn(`⚠️  CORS blocked: ${origin}`);
    return callback(new Error('CORS blocked'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));
app.use(helmet({
  // 'same-origin' (helmet default) blocks Google OAuth popup postMessage.
  // 'same-origin-allow-popups' allows OAuth popup windows to communicate back.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(morgan('dev'));

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const driveRoutes = require('./routes/driveRoutes');
const testRoutes = require('./routes/testRoutes');
const mockRoutes = require('./routes/mockRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tpoRoutes = require('./routes/tpoRoutes');
const companyRoutes = require('./routes/companyRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tpo', tpoRoutes);
app.use('/api/company', companyRoutes);
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

// ─── Environment detection ────────────────────────────────────────────────────
// Use URL-based detection — MYSQL_PUBLIC_URL (TCP proxy) or MYSQL_URL (private).
// Avoid MYSQLHOST — it points to mysql.railway.internal which causes ETIMEDOUT.
const isUnresolved  = (val) => !val || String(val).includes('${{');
const MYSQL_PUBLIC_URL = process.env.MYSQL_PUBLIC_URL;
const MYSQL_URL        = process.env.MYSQL_URL;
const isProduction  =
  (MYSQL_PUBLIC_URL && !isUnresolved(MYSQL_PUBLIC_URL)) ||
  (MYSQL_URL        && !isUnresolved(MYSQL_URL));

// Initialize Database and Server
const init = async () => {

  // ── Step 1: Local DB creation (skip in production) ───────────────────────
  if (isProduction) {
    console.log('🚀 Production mode (Railway) — skipping manual DB creation.');
  } else {
    const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '', DB_NAME = 'placement_portal' } = process.env;
    console.log(`💻 Local dev — ensuring database "${DB_NAME}" exists...`);
    try {
      const mysql = require('mysql2/promise');
      const conn  = await mysql.createConnection({ host: DB_HOST, port: parseInt(DB_PORT), user: DB_USER, password: DB_PASSWORD });
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      await conn.end();
      console.log(`✅ Database "${DB_NAME}" ensured.`);
    } catch {
      console.log('⚠️  Skipping DB creation (access restricted).');
    }
  }

  // ── Step 2: Connect via Sequelize with retry logic ────────────────────────
  // PROTOCOL_CONNECTION_LOST / Connection lost on Railway is a cold-start
  // race condition — MySQL container starts slower than the backend.
  // Retry up to 10 times with exponential backoff before giving up.
  const { sequelize } = require('./models');
  const MAX_RETRIES   = 10;
  const BASE_DELAY_MS = 3000; // 3s → 6s → 12s → 24s → 30s (capped)

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔍 DB connection attempt ${attempt}/${MAX_RETRIES}...`);
      await sequelize.authenticate();
      console.log('✅ Sequelize connected successfully.');
      break; // Success — exit the retry loop

    } catch (connErr) {
      const isLastAttempt = attempt === MAX_RETRIES;
      
      // Retry on any networking, socket, DNS or connection error. 
      // Skip retrying only for permanent failures like Access Denied or Bad Database.
      const isRetryable =
        connErr.original?.code !== 'ER_ACCESS_DENIED_ERROR' &&
        connErr.original?.code !== 'ER_BAD_DB_ERROR';

      console.error(`❌ Attempt ${attempt} failed: ${connErr.message}`);

      if (isLastAttempt || !isRetryable) {
        // Unrecoverable or out of retries
        console.error('💥 Could not connect to database after all attempts.');
        console.error('   Error name :', connErr.name);
        console.error('   Error code :', connErr.original?.code || 'N/A');
        if (connErr.original?.code === 'ETIMEDOUT')
          console.error('   └─ DB host unreachable. Check private networking or MYSQL_URL.');
        else if (connErr.original?.code === 'ER_ACCESS_DENIED_ERROR')
          console.error('   └─ Access denied. Check MYSQLUSER / MYSQLPASSWORD.');
        else
          console.error('   └─ Full error:', connErr.original || connErr);
        process.exit(1);
      }

      // Exponential backoff (capped at 30s)
      const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), 30000);
      console.log(`   ⏳ Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  // ── Step 3: Sync models ───────────────────────────────────────────────────
  if (isProduction) {
    try {
      console.log('🔍 Syncing models (non-fatal in production)...');
      await sequelize.sync({ alter: false });
      console.log('✅ Models synced.');
    } catch (syncErr) {
      console.warn('⚠️  Model sync warning (non-fatal):', syncErr.message);
      console.warn('   Existing tables are intact — server will continue.');
    }
  } else {
    console.log('🔍 Syncing models (local dev)...');
    await sequelize.sync({ alter: false });
    console.log('✅ Models synced.');
  }

  // ── Step 4: Start HTTP server ─────────────────────────────────────────────
  app.listen(PORT, () => {
    console.log(`\n✅ Server running on port ${PORT}`);
    console.log(`🌐 Mode: ${isProduction ? 'PRODUCTION (Railway)' : 'LOCAL DEV'}`);
    console.log('✨ Ready!\n');
  });
};

// Catch any top-level unhandled error
init().catch(err => {
  console.error('💥 Unhandled startup error:', err.message);
  process.exit(1);
});


