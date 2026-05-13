const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MockResponse = sequelize.define('MockResponse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  question: { type: DataTypes.TEXT, allowNull: false },
  student_answer: { type: DataTypes.TEXT, allowNull: false },
  ai_feedback: { type: DataTypes.TEXT, allowNull: true },
  correctness_score: { type: DataTypes.FLOAT, allowNull: true }
}, { timestamps: true });

module.exports = MockResponse;