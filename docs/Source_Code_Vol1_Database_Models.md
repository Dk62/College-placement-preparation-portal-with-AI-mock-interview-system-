# College Placement Preparation Portal
## Full Source Code Documentation — Volume 1
### Database Models (`backend/models/`)

---

## 1.1 Overview of the Database Layer

The entire MySQL database is managed through **Sequelize ORM** (Object Relational Mapping). Instead of writing raw SQL queries, all 15 database tables are defined as JavaScript class models. Sequelize automatically handles `CREATE TABLE`, `ALTER TABLE`, and all `INSERT`, `SELECT`, `UPDATE`, `DELETE` operations through a clean API.

**Database Engine:** MySQL 8 (hosted on Railway in production, local MySQL in development)
**ORM:** Sequelize v6
**Config File:** `backend/config/db.js`

---

## 1.2 Entity Relationship Overview

```
Users
  ├── StudentProfile (1:1)  → MockSession (1:N) → MockResponse (1:N)
  │                         → TestResult   (1:N)
  │                         → DriveApplication (1:N)
  │                         → Notification (1:N)
  ├── TPOProfile     (1:1)
  └── CompanyProfile (1:1)  → PlacementDrive (1:N) → DriveApplication (1:N)

QuestionBank ←→ AptitudeTest  (Many:Many via TestQuestion)
AuditLog  (standalone, references admin_id)
```

---

## 1.3 Model: `User.js`

**Table Name:** `Users`
**Purpose:** The root authentication identity for every person in the system. Every other table links back to this one via Foreign Keys.

### Full Source Code
```javascript
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
```

### Column Reference Table

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique row identifier |
| `name` | STRING | NOT NULL | Full display name |
| `email` | STRING | NOT NULL, UNIQUE | Login credential & contact |
| `password` | STRING | NOT NULL | bcrypt-hashed passkey |
| `role` | ENUM | NOT NULL | RBAC permission tier |
| `is_verified` | BOOLEAN | DEFAULT false | Email verification flag |
| `google_id` | STRING | nullable | Google OAuth sub ID |
| `profile_pic` | STRING | nullable | Cloudinary CDN URL |
| `profile_pic_public_id` | STRING | nullable | For Cloudinary deletion API |
| `phone` | STRING | UNIQUE, nullable | OTP recovery channel |
| `reset_password_otp` | STRING | nullable | 6-digit recovery code |
| `reset_password_expires` | DATE | nullable | OTP expiry timestamp |

---

## 1.4 Model: `StudentProfile.js`

**Table Name:** `StudentProfiles`
**Purpose:** Stores all academic and professional data for student users. The `skills`, `projects`, `certifications`, and `experience` columns use `DataTypes.JSON`, which allows storing nested arrays/objects directly into MySQL.

### Full Source Code
```javascript
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
```

### JSON Column Schemas
The `skills` column stores a categorized dictionary:
```json
{
  "languages": "JavaScript, C, Java",
  "frontend": "React 18, Tailwind CSS",
  "backend": "Node.js, Express.js, MySQL",
  "tools": "Git, Vite, Postman"
}
```
The `projects` column stores an array of project objects:
```json
[
  { "title": "Portal", "technologies": "React, Node", "description": "...", "link": "https://..." }
]
```

---

## 1.5 Model: `PlacementDrive.js`

**Table Name:** `PlacementDrives`
**Purpose:** Stores corporate job drive listings. Uses an ENUM for `status` to enforce valid lifecycle states.

### Full Source Code
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlacementDrive = sequelize.define('PlacementDrive', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  job_role: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  eligibility_cgpa: { type: DataTypes.FLOAT, allowNull: false },
  eligibility_branch: { type: DataTypes.STRING, allowNull: false },
  package_lpa: { type: DataTypes.FLOAT, allowNull: true },
  status: { type: DataTypes.ENUM('Upcoming', 'Ongoing', 'Completed'), defaultValue: 'Upcoming' },
  drive_date: { type: DataTypes.DATE, allowNull: false }
}, { timestamps: true });

module.exports = PlacementDrive;
```

---

## 1.6 Model: `DriveApplication.js`

**Table Name:** `DriveApplications`
**Purpose:** The junction/bridge table linking a `StudentProfile` to a `PlacementDrive`. Tracks application status via a 4-stage lifecycle ENUM.

### Full Source Code
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DriveApplication = sequelize.define('DriveApplication', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: {
    type: DataTypes.ENUM('Applied', 'Shortlisted', 'Selected', 'Rejected'),
    defaultValue: 'Applied'
  }
}, { timestamps: true });

module.exports = DriveApplication;
```

**Lifecycle Flow:** `Applied` → `Shortlisted` → `Selected` OR `Rejected`

---

## 1.7 Model: `MockSession.js`

**Table Name:** `MockSessions`
**Purpose:** Stores each AI Mock Interview session. The `overall_score` is calculated as the average of all `MockResponse.correctness_score` values when the session is marked complete.

### Full Source Code
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MockSession = sequelize.define('MockSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  domain: { type: DataTypes.STRING, allowNull: false },
  overall_score: { type: DataTypes.FLOAT, allowNull: true },
  feedback_summary: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true });

module.exports = MockSession;
```

---

## 1.8 Model: `MockResponse.js`

**Table Name:** `MockResponses`
**Purpose:** Stores each individual question-answer pair within a session. `ai_feedback` holds Gemini's analysis text and `correctness_score` holds the numeric 0–100 grade per question.

### Full Source Code
```javascript
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
```

---

## 1.9 Model: `QuestionBank.js`

**Table Name:** `QuestionBanks`
**Purpose:** Stores all MCQ questions — both manually added by Admin and AI-generated. Used in AptitudeTests. The `options` column stores the 4 choices as a JSON array.

### Full Source Code
```javascript
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
```

### Example Database Row
```json
{
  "domain": "React.js",
  "topic": "Hooks",
  "difficulty": "Medium",
  "question_text": "What does useEffect() do?",
  "options": ["Manages state", "Handles side effects", "Renders JSX", "None"],
  "correct_option": "Handles side effects"
}
```

---

## 1.10 Model: `TestResult.js`

**Table Name:** `TestResults`
**Purpose:** Stores the final result of a completed AptitudeTest attempt. `accuracy_percentage` is a derived field computed on the frontend.

### Full Source Code
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TestResult = sequelize.define('TestResult', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  score: { type: DataTypes.INTEGER, allowNull: false },
  accuracy_percentage: { type: DataTypes.FLOAT, allowNull: false },
  completed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: true });

module.exports = TestResult;
```

---

## 1.11 Model: `Notification.js`

**Table Name:** `Notifications`
**Purpose:** Stores in-app notification messages. The `is_read` boolean flag drives the red badge counter on the Navbar bell icon.

### Full Source Code
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message: { type: DataTypes.STRING, allowNull: false },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  type: { type: DataTypes.STRING, allowNull: true }
}, { timestamps: true });

module.exports = Notification;
```

---

## 1.12 Model: `AuditLog.js`

**Table Name:** `AuditLogs`
**Purpose:** A tamper-evident activity ledger for all Admin actions. Every CREATE, DELETE, or USER_STATUS_CHANGE action by an Admin is permanently recorded here.

### Full Source Code
```javascript
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
```

### Example Log Entries
```json
{ "action_type": "DELETE", "target_entity": "User", "details": "Removed user john@example.com (ID: 42)" }
{ "action_type": "CREATE", "target_entity": "QuestionBank", "details": "Added MCQ for domain React.js" }
```
