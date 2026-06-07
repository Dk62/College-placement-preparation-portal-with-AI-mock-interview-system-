const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

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

// Initialize Database and Server
const init = async () => {
  try {
    // 1. Create Database if it doesn't exist
    console.log('🔍 Attempting to connect to database...');
   console.log("DB_HOST:", process.env.DB_HOST);
   console.log("MYSQLHOST:", process.env.MYSQLHOST);
   console.log("DB_PORT:", process.env.DB_PORT);
   console.log("MYSQLPORT:", process.env.MYSQLPORT);
   console.log("DB_USER:", process.env.DB_USER);
   console.log("MYSQLUSER:", process.env.MYSQLUSER);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? '******' : undefined);
    console.log("MYSQLPASSWORD:", process.env.MYSQLPASSWORD ? '******' : undefined);
   console.log("DB_NAME:", process.env.DB_NAME);
    console.log("MYSQLDATABASE:", process.env.MYSQLDATABASE);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || process.env.MYSQLHOST,
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
      user: process.env.DB_USER || process.env.MYSQLUSER,
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Database dropping is removed for persistent storage
    const targetDbName = process.env.DB_NAME || process.env.MYSQLDATABASE;
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDbName}\`;`);
      console.log(`✅ Database ${targetDbName} ensured.`);
    } catch (dbError) {
      console.log(`⚠️  Skipping DB creation (Managed Cloud Database detected or access restricted).`);
    }
    await connection.end();

    // 2. Connect Sequelize and Sync Models
    console.log('🔍 Connecting to Sequelize...');
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Sequelize database connected successfully.');
    
    // Sync models — use { alter: false } to avoid MySQL's 64-key-per-table limit.
    // On first run or after adding new columns, temporarily set alter: true, then revert.
    // NEVER use { force: true } in production — it drops all tables!
    console.log('🔍 Syncing database models...');
    await sequelize.sync({ alter: false });
    console.log('✅ Database synced.');

    // 3. Start Server
    app.listen(PORT, () => {
      console.log(`\n✅ Server is running on port ${PORT}`);
      console.log(`📍 Frontend should connect to: http://localhost:${PORT}/api/auth/login`);
      console.log(`🌐 CORS enabled for: http://localhost:5173`);
      console.log('\n✨ Ready to accept requests!\n');
    });
  } catch (error) {
    console.error("Full database connection error:");
    console.error(error);
    if (error.code === 'ENOTFOUND') {
      console.error('   └─ Database host not found. Check your DB_HOST in .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   └─ Connection refused. Is MySQL running on the specified host:port?');
    } else if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.error('   └─ Access denied. Check DB_USER and DB_PASSWORD in .env');
    }
    process.exit(1);
  }
};

init();
