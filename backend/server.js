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
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL];
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    return callback(new Error('CORS blocked cross-origin request'), false);
  },
  credentials: true
}));
app.use(helmet());
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

// ─── Detect environment ───────────────────────────────────────────────────────
const isRailwayUnresolved = (val) => !val || val.includes('${{');
const MYSQL_URL = process.env.MYSQL_URL;
const isProduction = MYSQL_URL && !isRailwayUnresolved(MYSQL_URL);

// Initialize Database and Server
const init = async () => {
  try {
    if (isProduction) {
      // ── PRODUCTION (Railway) ──────────────────────────────────────────────
      // Railway manages the DB — no need to CREATE DATABASE manually.
      // Just connect via Sequelize using MYSQL_URL.
      console.log('🚀 Production mode detected (Railway)');
      console.log('🔍 Connecting to Railway MySQL via MYSQL_URL...');
    } else {
      // ── LOCAL DEVELOPMENT ─────────────────────────────────────────────────
      const { DB_HOST, DB_PORT, DB_USER, DB_NAME } = process.env;
      console.log('💻 Local development mode');
      console.log(`🔍 Connecting to local MySQL at ${DB_HOST}:${DB_PORT || 3306}...`);

      // Create the local database if it doesn't exist
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: DB_HOST || 'localhost',
        port: parseInt(DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
      });
      console.log('✅ Connected to local MySQL server');
      const targetDb = DB_NAME || 'placement_portal';
      try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDb}\`;`);
        console.log(`✅ Database "${targetDb}" ensured.`);
      } catch {
        console.log('⚠️  Skipping DB creation (access restricted).');
      }
      await connection.end();
    }

    // 2. Connect Sequelize and Sync Models
    console.log('🔍 Connecting via Sequelize...');
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Sequelize database connected successfully.');

    // Sync models — alter:false avoids MySQL's 64-key-per-table limit.
    console.log('🔍 Syncing database models...');
    await sequelize.sync({ alter: false });
    console.log('✅ Database synced.');

    // 3. Start Server
    app.listen(PORT, () => {
      console.log(`\n✅ Server is running on port ${PORT}`);
      console.log(`🌐 Mode: ${isProduction ? 'PRODUCTION (Railway)' : 'LOCAL DEV'}`);
      console.log('\n✨ Ready to accept requests!\n');
    });
  } catch (error) {
    console.error('\n❌ Failed to initialize server:', error.message);
    console.error('Error code:', error.code);
    if (error.code === 'ETIMEDOUT') {
      console.error('   └─ Connection timed out. Check MYSQL_URL on Railway dashboard.');
      console.error('   └─ Ensure MySQL service is linked to this Railway service.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   └─ Database host not found. Check DB_HOST / MYSQL_URL.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   └─ Connection refused. Is MySQL running?');
    } else if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.error('   └─ Access denied. Check DB credentials.');
    }
    process.exit(1);
  }
};

init();
