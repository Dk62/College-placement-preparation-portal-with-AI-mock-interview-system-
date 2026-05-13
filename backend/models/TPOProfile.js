const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TPOProfile = sequelize.define('TPOProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  department: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

module.exports = TPOProfile;