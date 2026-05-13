const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MockSession = sequelize.define('MockSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  domain: { type: DataTypes.STRING, allowNull: false },
  overall_score: { type: DataTypes.FLOAT, allowNull: true },
  feedback_summary: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true });

module.exports = MockSession;