const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AptitudeTest = sequelize.define('AptitudeTest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, allowNull: false },
  total_marks: { type: DataTypes.INTEGER, allowNull: false }
}, { timestamps: true });

module.exports = AptitudeTest;