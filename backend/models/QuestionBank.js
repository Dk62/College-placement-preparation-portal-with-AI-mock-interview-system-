const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuestionBank = sequelize.define('QuestionBank', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  domain: { type: DataTypes.STRING, allowNull: false },
  topic: { type: DataTypes.STRING, allowNull: false },
  difficulty: { type: DataTypes.ENUM('Easy', 'Medium', 'Hard'), defaultValue: 'Medium' },
  question_text: { type: DataTypes.TEXT, allowNull: false },
  options: { type: DataTypes.JSON, allowNull: false },
  correct_option: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

module.exports = QuestionBank;