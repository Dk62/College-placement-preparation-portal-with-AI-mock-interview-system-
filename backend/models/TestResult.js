const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TestResult = sequelize.define('TestResult', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  score: { type: DataTypes.INTEGER, allowNull: false },
  accuracy_percentage: { type: DataTypes.FLOAT, allowNull: false },
  completed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: true });

module.exports = TestResult;