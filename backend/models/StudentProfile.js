const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentProfile = sequelize.define('StudentProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  enrollment_no: { type: DataTypes.STRING, unique: true, allowNull: true },
  branch: { type: DataTypes.STRING, allowNull: true },
  cgpa: { type: DataTypes.FLOAT, allowNull: true },
  resume_link: { type: DataTypes.STRING, allowNull: true },
  linkedin_link: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  github_link: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  degree: { type: DataTypes.STRING, allowNull: true },
  academic_year: { type: DataTypes.STRING, allowNull: true },
  current_semester: { type: DataTypes.STRING, allowNull: true },
  skills: { type: DataTypes.JSON, allowNull: true },
  experience: { type: DataTypes.JSON, allowNull: true },
  projects: { type: DataTypes.JSON, allowNull: true },
  certifications: { type: DataTypes.JSON, allowNull: true },
  objective: { type: DataTypes.TEXT, allowNull: true },
  tenth_board: { type: DataTypes.STRING, allowNull: true },
  tenth_percent: { type: DataTypes.STRING, allowNull: true },
  tenth_year: { type: DataTypes.STRING, allowNull: true },
  twelfth_board: { type: DataTypes.STRING, allowNull: true },
  twelfth_percent: { type: DataTypes.STRING, allowNull: true },
  twelfth_year: { type: DataTypes.STRING, allowNull: true }
}, { timestamps: true });

module.exports = StudentProfile;