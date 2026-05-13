const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  admin_id: { type: DataTypes.INTEGER, allowNull: false },
  action_type: { type: DataTypes.STRING, allowNull: false }, // 'CREATE', 'UPDATE', 'DELETE', 'USER_STATUS_CHANGE'
  target_entity: { type: DataTypes.STRING, allowNull: false }, // 'User', 'QuestionBank', 'PlacementDrive'
  details: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true });

module.exports = AuditLog;
