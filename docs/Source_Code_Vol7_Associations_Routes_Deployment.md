# College Placement Preparation Portal
## Full Source Code Documentation — Volume 7
### Backend: `models/index.js` Associations, Routes Map & Deployment Config

---

## 7.1 Sequelize Model Associations (`backend/models/index.js`)

**Purpose:** This is the most architecturally critical file in the backend. It imports all 15 models and defines the **relational foreign key links** between them. Without this file, Sequelize has no idea how tables relate to each other. This file enables all `include: [{ model: X }]` SQL JOIN operations throughout the controllers.

### Full Source Code
```javascript
const sequelize = require('../config/db');

// Import all models
const User = require('./User');
const StudentProfile = require('./StudentProfile');
const TPOProfile = require('./TPOProfile');
const CompanyProfile = require('./CompanyProfile');
const PlacementDrive = require('./PlacementDrive');
const DriveApplication = require('./DriveApplication');
const MockSession = require('./MockSession');
const MockResponse = require('./MockResponse');
const QuestionBank = require('./QuestionBank');
const AptitudeTest = require('./AptitudeTest');
const TestQuestion = require('./TestQuestion');
const TestResult = require('./TestResult');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// ──────────────────────────────────────────────────────
// USER 1:1 RELATIONSHIPS
// ──────────────────────────────────────────────────────

// Each User has exactly one role-specific profile
User.hasOne(StudentProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudentProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(TPOProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
TPOProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(CompanyProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
CompanyProfile.belongsTo(User, { foreignKey: 'userId' });

// ──────────────────────────────────────────────────────
// COMPANY → DRIVES (1:N)
// ──────────────────────────────────────────────────────

// A company can post multiple placement drives
CompanyProfile.hasMany(PlacementDrive, { foreignKey: 'companyId', onDelete: 'CASCADE' });
PlacementDrive.belongsTo(CompanyProfile, { foreignKey: 'companyId' });

// ──────────────────────────────────────────────────────
// STUDENT → APPLICATIONS (1:N)
// ──────────────────────────────────────────────────────

// A student can apply to multiple drives
StudentProfile.hasMany(DriveApplication, { foreignKey: 'studentId', onDelete: 'CASCADE' });
DriveApplication.belongsTo(StudentProfile, { foreignKey: 'studentId' });

// Each drive can have many applications
PlacementDrive.hasMany(DriveApplication, { foreignKey: 'driveId', onDelete: 'CASCADE' });
DriveApplication.belongsTo(PlacementDrive, { foreignKey: 'driveId' });

// ──────────────────────────────────────────────────────
// STUDENT → MOCK INTERVIEWS (1:N)
// ──────────────────────────────────────────────────────

// A student can have many mock sessions over time
StudentProfile.hasMany(MockSession, { foreignKey: 'studentId', onDelete: 'CASCADE' });
MockSession.belongsTo(StudentProfile, { foreignKey: 'studentId' });

// Each session contains many individual Q&A responses
MockSession.hasMany(MockResponse, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
MockResponse.belongsTo(MockSession, { foreignKey: 'sessionId' });

// ──────────────────────────────────────────────────────
// TESTS (Many:Many via junction table)
// ──────────────────────────────────────────────────────

// A test can have many questions; a question can appear in many tests
AptitudeTest.belongsToMany(QuestionBank, { through: TestQuestion });
QuestionBank.belongsToMany(AptitudeTest, { through: TestQuestion });

// A student can have many test results
StudentProfile.hasMany(TestResult, { foreignKey: 'studentId', onDelete: 'CASCADE' });
TestResult.belongsTo(StudentProfile, { foreignKey: 'studentId' });

// A test can have many result records
AptitudeTest.hasMany(TestResult, { foreignKey: 'testId', onDelete: 'CASCADE' });
TestResult.belongsTo(AptitudeTest, { foreignKey: 'testId' });

// ──────────────────────────────────────────────────────
// USER → NOTIFICATIONS (1:N)
// ──────────────────────────────────────────────────────

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// ──────────────────────────────────────────────────────
// ADMIN AUDIT LOGS
// ──────────────────────────────────────────────────────

// Allow JOIN to fetch admin's name alongside their log entries
User.hasMany(AuditLog, { foreignKey: 'admin_id', as: 'AdminUser' });
AuditLog.belongsTo(User, { foreignKey: 'admin_id', as: 'AdminUser' });

// Export everything for use in controllers
module.exports = {
  sequelize,
  User, StudentProfile, TPOProfile, CompanyProfile,
  PlacementDrive, DriveApplication,
  MockSession, MockResponse,
  QuestionBank, AptitudeTest, TestQuestion, TestResult,
  Notification, AuditLog
};
```

### Association Diagram (Text)
```
User
 ├─ hasOne StudentProfile    (FK: userId) → CASCADE DELETE
 │    ├─ hasMany MockSession  (FK: studentId) → CASCADE DELETE
 │    │    └─ hasMany MockResponse (FK: sessionId)
 │    ├─ hasMany TestResult   (FK: studentId)
 │    ├─ hasMany DriveApplication (FK: studentId)
 │    └─ hasMany Notification (via User FK: userId)
 ├─ hasOne TPOProfile         (FK: userId) → CASCADE DELETE
 ├─ hasOne CompanyProfile     (FK: userId) → CASCADE DELETE
 │    └─ hasMany PlacementDrive (FK: companyId) → CASCADE DELETE
 │         └─ hasMany DriveApplication (FK: driveId)
 └─ hasMany Notification      (FK: userId)

AptitudeTest ←(TestQuestion)→ QuestionBank  [Many:Many]
AuditLog.admin_id → User.id  [as: 'AdminUser']
```

### Why `onDelete: 'CASCADE'`?
When a User account is deleted (by Admin), every linked profile, session, application, and notification is automatically deleted too. Without CASCADE, you'd have "orphan records" — database rows referencing a non-existent user ID, causing crashes and data corruption.

---

## 7.2 Complete Backend API Route Map

All routes registered in `server.js`:

```javascript
// server.js route registrations
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/drives', require('./routes/driveRoutes'));
app.use('/api/mock', require('./routes/mockRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tpo', require('./routes/tpoRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
```

### Full API Endpoint Reference

#### Auth Routes (`/api/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Authenticate, set JWT cookie |
| POST | `/api/auth/google` | Google OAuth federated login |
| GET | `/api/auth/me` | Get current user data |
| POST | `/api/auth/logout` | Clear JWT cookie |
| POST | `/api/auth/forgot-password` | Send OTP recovery code |
| POST | `/api/auth/reset-password` | Set new password with OTP |

#### Profile Routes (`/api/profiles/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/me` | Fetch my role-specific profile |
| PUT | `/api/profiles/student` | Update student ATS data |
| GET | `/api/profiles/student/resume` | Stream PDF resume |
| POST | `/api/profiles/student/analyze-resume` | AI analysis of stored data |
| POST | `/api/profiles/student/analyze-upload` | AI analysis of uploaded PDF |
| POST | `/api/profiles/avatar` | Upload profile image to Cloudinary |

#### Drive Routes (`/api/drives/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drives` | List all drives |
| POST | `/api/drives` | Create drive (Company/TPO) |
| POST | `/api/drives/:id/apply` | Apply for a drive (Student) |
| PUT | `/api/drives/applications/:id` | Update applicant status |

#### Mock Interview Routes (`/api/mock/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mock/sessions` | Start new session |
| POST | `/api/mock/sessions/:id/responses` | Submit answer + get AI grade |
| PUT | `/api/mock/sessions/:id/complete` | Average scores + finalize |

#### Test Routes (`/api/tests/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tests` | Get all tests |
| POST | `/api/tests/generate` | Generate AI test from domain |
| POST | `/api/tests/:id/submit` | Record test result |

#### Admin Routes (`/api/admin/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users (searchable) |
| DELETE | `/api/admin/users/:id` | Remove user |
| GET | `/api/admin/questions` | Question bank |
| POST | `/api/admin/questions` | Add MCQ question |
| DELETE | `/api/admin/questions/:id` | Delete question |
| GET | `/api/admin/logs` | Audit log trail |

#### TPO Routes (`/api/tpo/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tpo/analytics` | Active drives + avg CTC |
| GET | `/api/tpo/companies` | Company verification list |
| PUT | `/api/tpo/companies/:id/approve` | Verify a company |
| POST | `/api/tpo/drives` | Launch placement drive |
| GET | `/api/tpo/tracker` | Student readiness scores |
| POST | `/api/tpo/broadcast` | Send mass notifications + email |
| GET | `/api/tpo/export` | Download CSV report |

#### Company Routes (`/api/company/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/company/profile` | Get company profile |
| PUT | `/api/company/profile` | Update company profile |
| GET | `/api/company/drives` | Get own drives |
| POST | `/api/company/drives` | Post new drive (if verified) |
| GET | `/api/company/drives/:driveId/applications` | View applicants |
| PUT | `/api/company/applications/:id` | Shortlist/Select/Reject |
| GET | `/api/company/applications/:id/offer` | Generate PDF offer letter |

---

## 7.3 Environment Variables Reference

### Backend (`backend/.env`)
```bash
# Application
PORT=5000
NODE_ENV=development

# MySQL Database
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLDATABASE=placement_portal
MYSQLUSER=root
MYSQLPASSWORD=yourpassword

# Authentication
JWT_SECRET=your_very_long_random_secret_key
JWT_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# AI
GEMINI_API_KEY=AIza_your_gemini_api_key

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASSWORD=your_16_char_app_password

# Cloudinary CDN
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env`)
```bash
# Railway backend URL (no trailing slash)
VITE_API_URL=https://your-app.railway.app

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 7.4 Production Deployment Architecture

```
                    ┌───────────────────────────────┐
                    │        VERCEL (Frontend)       │
                    │   React 18 + Vite Build        │
                    │   auto-deploy on git push      │
                    │   VITE_API_URL = Railway URL   │
                    └────────────┬──────────────────┘
                                 │  HTTPS API calls
                    ┌────────────▼──────────────────┐
                    │       RAILWAY (Backend)        │
                    │   Node.js / Express.js         │
                    │   auto-deploy on git push      │
                    │   PORT = 5000 (auto-assigned)  │
                    └────────────┬──────────────────┘
                                 │  Sequelize ORM
                    ┌────────────▼──────────────────┐
                    │       RAILWAY (MySQL)          │
                    │   MySQL 8 managed database     │
                    │   MYSQLHOST = internal Railway │
                    └───────────────────────────────┘
                    
External Services:
    Cloudinary   ← Avatar image CDN
    Gmail SMTP   ← OTP recovery + notification emails
    Google OAuth ← Federated identity for sign-in
    Gemini AI    ← Mock interview evaluation + test generation
```
