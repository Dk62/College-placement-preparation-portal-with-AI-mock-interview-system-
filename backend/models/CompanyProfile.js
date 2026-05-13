const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CompanyProfile = sequelize.define('CompanyProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  company_name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  website: { type: DataTypes.STRING, allowNull: true },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

module.exports = CompanyProfile;