const sequelize = require('../config/db');

const User = require('./User');
const StudentProfile = require('./StudentProfile');
const TPOProfile = require('./TPOProfile');
const CompanyProfile = require('./CompanyProfile');
const PlacementDrive = require('./PlacementDrive');
const DriveApplication = require('./DriveApplication');
const QuestionBank = require('./QuestionBank');
const AptitudeTest = require('./AptitudeTest');
const TestQuestion = require('./TestQuestion');
const TestResult = require('./TestResult');
const MockSession = require('./MockSession');
const MockResponse = require('./MockResponse');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// Define Relationships
// User Profiles
User.hasOne(StudentProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudentProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(TPOProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
TPOProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(CompanyProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
CompanyProfile.belongsTo(User, { foreignKey: 'userId' });

// Placement Drives
CompanyProfile.hasMany(PlacementDrive, { foreignKey: 'companyId', onDelete: 'CASCADE' });
PlacementDrive.belongsTo(CompanyProfile, { foreignKey: 'companyId' });

// Drive Applications
StudentProfile.hasMany(DriveApplication, { foreignKey: 'studentId', onDelete: 'CASCADE' });
DriveApplication.belongsTo(StudentProfile, { foreignKey: 'studentId' });

PlacementDrive.hasMany(DriveApplication, { foreignKey: 'driveId', onDelete: 'CASCADE' });
DriveApplication.belongsTo(PlacementDrive, { foreignKey: 'driveId' });

// Aptitude Tests
AptitudeTest.belongsToMany(QuestionBank, { through: TestQuestion, foreignKey: 'testId', otherKey: 'questionId' });
QuestionBank.belongsToMany(AptitudeTest, { through: TestQuestion, foreignKey: 'questionId', otherKey: 'testId' });

StudentProfile.hasMany(TestResult, { foreignKey: 'studentId', onDelete: 'CASCADE' });
TestResult.belongsTo(StudentProfile, { foreignKey: 'studentId' });

AptitudeTest.hasMany(TestResult, { foreignKey: 'testId', onDelete: 'CASCADE' });
TestResult.belongsTo(AptitudeTest, { foreignKey: 'testId' });

// Mock Sessions
StudentProfile.hasMany(MockSession, { foreignKey: 'studentId', onDelete: 'CASCADE' });
MockSession.belongsTo(StudentProfile, { foreignKey: 'studentId' });

MockSession.hasMany(MockResponse, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
MockResponse.belongsTo(MockSession, { foreignKey: 'sessionId' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Audit Tracking
User.hasMany(AuditLog, { foreignKey: 'admin_id' });
AuditLog.belongsTo(User, { foreignKey: 'admin_id', as: 'AdminUser' });

module.exports = {
  sequelize,
  User,
  StudentProfile,
  TPOProfile,
  CompanyProfile,
  PlacementDrive,
  DriveApplication,
  QuestionBank,
  AptitudeTest,
  TestQuestion,
  TestResult,
  MockSession,
  MockResponse,
  Notification,
  AuditLog
};