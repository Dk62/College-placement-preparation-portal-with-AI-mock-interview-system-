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
// Use MYSQLHOST — Railway always resolves this properly for linked MySQL services.
const isUnresolved  = (val) => !val || String(val).includes('${{');
const isProduction  = !isUnresolved(process.env.MYSQLHOST);

// Initialize Database and Server
const init = async () => {
  try {
    if (isProduction) {
      console.log('🚀 Production mode (Railway) — skipping manual DB creation.');
    } else {
      // ── LOCAL: create database if missing ──────────────────────────────────
      const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '', DB_NAME = 'placement_portal' } = process.env;
      console.log(`💻 Local dev — ensuring database "${DB_NAME}" exists...`);
      const mysql = require('mysql2/promise');
      const conn  = await mysql.createConnection({ host: DB_HOST, port: parseInt(DB_PORT), user: DB_USER, password: DB_PASSWORD });
      try {
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`✅ Database "${DB_NAME}" ensured.`);
      } catch {
        console.log('⚠️  Skipping DB creation (access restricted).');
      }
      await conn.end();
    }

    // ── Connect via Sequelize ─────────────────────────────────────────────────
    console.log('🔍 Connecting via Sequelize...');
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Sequelize connected successfully.');

    // ── Sync models ───────────────────────────────────────────────────────────
    // In production: sync is non-fatal — tables persist between deploys.
    // In local dev: sync is required to create the schema on first run.
    if (isProduction) {
      try {
        console.log('🔍 Syncing models (production — non-fatal)...');
        await sequelize.sync({ alter: false });
        console.log('✅ Models synced.');
      } catch (syncErr) {
        // Warn but don't crash — existing tables are fine, the server can still serve requests.
        console.warn('⚠️  Model sync warning (non-fatal):', syncErr.message);
        console.warn('   Tables may already exist — continuing startup.');
      }
    } else {
      console.log('🔍 Syncing models (local dev)...');
      await sequelize.sync({ alter: false });
      console.log('✅ Models synced.');
    }

    // ── Start HTTP server ─────────────────────────────────────────────────────
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`🌐 Mode: ${isProduction ? 'PRODUCTION (Railway)' : 'LOCAL DEV'}`);
      console.log('✨ Ready!\n');
    });

  } catch (error) {
    console.error('\n❌ Server startup failed:', error.message);
    console.error('   Error code   :', error.code || 'N/A');
    console.error('   Error name   :', error.name || 'N/A');
    // Log full error for "Connection lost" which has no .code
    if (!error.code) console.error('   Full error:', error);

    if (error.code === 'ETIMEDOUT')               console.error('   └─ DB host unreachable. Check MYSQLHOST is linked in Railway dashboard.');
    else if (error.code === 'ENOTFOUND')          console.error('   └─ DB hostname not found.');
    else if (error.code === 'ECONNREFUSED')       console.error('   └─ DB refused connection. Is MySQL running?');
    else if (error.code === 'ER_ACCESS_DENIED_FOR_USER') console.error('   └─ Access denied. Check MYSQLUSER / MYSQLPASSWORD.');

    process.exit(1);
  }
};

init();

