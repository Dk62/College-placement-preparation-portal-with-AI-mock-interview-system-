const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('Student', 'TPO', 'Company', 'Admin'), allowNull: false },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  google_id: { type: DataTypes.STRING, allowNull: true },
  profile_pic: { type: DataTypes.STRING, allowNull: true },
  profile_pic_public_id: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true, unique: true },
  reset_password_otp: { type: DataTypes.STRING, allowNull: true },
  reset_password_expires: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true });

module.exports = User;