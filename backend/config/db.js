const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Use DB_HOST/DB_USER/DB_PASSWORD for local development, 
// fall back to MYSQL* variables for production (Railway)
const dbHost = process.env.DB_HOST || process.env.MYSQLHOST;
const dbUser = process.env.DB_USER || process.env.MYSQLUSER;
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE;
const dbPort = process.env.DB_PORT || process.env.MYSQLPORT || 3306;

if (!dbHost || !dbUser || !dbPassword || !dbName) {
  console.error('❌ Missing database configuration! Please set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env');
  process.exit(1);
}

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
  }
);

module.exports = sequelize;
