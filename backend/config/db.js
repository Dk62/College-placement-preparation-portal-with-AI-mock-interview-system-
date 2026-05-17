const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE || process.env.DB_NAME,
  process.env.MYSQLUSER || process.env.DB_USER,
  process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
  }
);

module.exports = sequelize;
