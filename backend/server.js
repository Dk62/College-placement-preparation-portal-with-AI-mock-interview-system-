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
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST || process.env.DB_HOST,
      port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
      user: process.env.MYSQLUSER || process.env.DB_USER,
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    });
    
    // Database dropping is removed for persistent storage
    const targetDbName = process.env.MYSQLDATABASE || process.env.DB_NAME;
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDbName}\`;`);
    await connection.end();
    console.log(`Database ${targetDbName} ensured.`);

    // 2. Connect Sequelize and Sync Models
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Sync models (in development, alter: true updates tables without dropping them)
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // 3. Start Server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

init();
