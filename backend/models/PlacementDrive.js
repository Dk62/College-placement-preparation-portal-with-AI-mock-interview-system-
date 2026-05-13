const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlacementDrive = sequelize.define('PlacementDrive', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  job_role: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  eligibility_cgpa: { type: DataTypes.FLOAT, allowNull: false },
  eligibility_branch: { type: DataTypes.STRING, allowNull: false },
  package_lpa: { type: DataTypes.FLOAT, allowNull: true },
  status: { type: DataTypes.ENUM('Upcoming', 'Ongoing', 'Completed'), defaultValue: 'Upcoming' },
  drive_date: { type: DataTypes.DATE, allowNull: false }
}, { timestamps: true });

module.exports = PlacementDrive;