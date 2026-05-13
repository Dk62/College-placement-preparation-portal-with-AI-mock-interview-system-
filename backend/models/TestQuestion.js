const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TestQuestion = sequelize.define('TestQuestion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
}, { timestamps: true });

module.exports = TestQuestion;