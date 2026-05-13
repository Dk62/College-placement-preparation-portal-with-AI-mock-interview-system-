const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DriveApplication = sequelize.define('DriveApplication', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.ENUM('Applied', 'Shortlisted', 'Selected', 'Rejected'), defaultValue: 'Applied' }
}, { timestamps: true });

module.exports = DriveApplication;