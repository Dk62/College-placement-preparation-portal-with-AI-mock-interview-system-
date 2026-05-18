# College Placement Preparation Portal
## Full Source Code Documentation — Volume 3
### Backend Controllers: Admin, TPO, Test Generation

---

## 3.1 Admin Controller (`backend/controllers/adminController.js`)

**Routes prefix:** `/api/admin/`
**Access:** Restricted to `role: Admin` via `authorize('Admin')` middleware
**Purpose:** Provides God-level system control — viewing platform statistics, managing all user accounts, controlling the question bank, and reading audit logs.

### Full Source Code
```javascript
const { User, QuestionBank, PlacementDrive, CompanyProfile, StudentProfile, AuditLog, sequelize } = require('../models');
const { Op } = require('sequelize');

// Internal helper: Write all admin actions to the AuditLog table
const logAction = async (adminId, action, entity, info) => {
  try {
    await AuditLog.create({
      admin_id: adminId,
      action_type: action,       // e.g., 'DELETE', 'CREATE'
      target_entity: entity,    // e.g., 'User', 'QuestionBank'
      details: info              // Human-readable description
    });
  } catch (e) {
    console.error('Failed to log audit action', e);
  }
};

// ──────────────────────────────────────────────────────
// ANALYTICS & STATISTICS
// ──────────────────────────────────────────────────────

// @route   GET /api/admin/stats
// @desc    Aggregate platform-wide counts from 4 tables simultaneously
exports.getAdminStats = async (req, res) => {
  try {
    // Parallel SQL COUNT queries using Promise.all for optimal performance
    const counts = await Promise.all([
      User.count({ where: { role: 'Student' } }),
      CompanyProfile.count(),
      PlacementDrive.count(),
      AuditLog.count()
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: counts[0],
        registeredCompanies: counts[1],
        activeDrives: counts[2],
        systemLogs: counts[3]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────────────
// USER MANAGEMENT
// ──────────────────────────────────────────────────────

// @route   GET /api/admin/users
// @desc    Fetch all users with optional search & role filter
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let whereCondition = {};

    // Dynamic SQL WHERE clause construction
    if (search) {
      whereCondition = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    if (role) whereCondition.role = role;

    const users = await User.findAll({
      where: whereCondition,
      attributes: ['id', 'name', 'email', 'role', 'createdAt'], // Never expose password
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/admin/users/:id
// @desc    Permanently delete a user (CASCADE deletes linked profiles)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Log BEFORE deletion (the record is gone afterwards)
    await logAction(req.user.id, 'DELETE', 'User', `Removed user ${user.email} (ID: ${user.id})`);
    await user.destroy(); // Triggers CASCADE DELETE on StudentProfile, MockSessions, etc.

    res.json({ success: true, message: 'User successfully removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────────────
// QUESTION BANK MANAGEMENT
// ──────────────────────────────────────────────────────

// @route   GET /api/admin/questions
// @desc    Get all questions, optionally filtered by domain
exports.getQuestionBank = async (req, res) => {
  try {
    const { domain } = req.query;
    const condition = domain ? { domain } : {}; // No domain = return all

    const questions = await QuestionBank.findAll({
      where: condition,
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/admin/questions
// @desc    Add a new MCQ question to the bank
exports.addQuestion = async (req, res) => {
  try {
    const q = await QuestionBank.create(req.body);
    await logAction(req.user.id, 'CREATE', 'QuestionBank', `Added MCQ for domain ${q.domain}`);
    res.status(201).json({ success: true, data: q });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/admin/questions/:id
// @desc    Remove a question from the bank
exports.deleteQuestion = async (req, res) => {
  try {
    const q = await QuestionBank.findByPk(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: 'Item not found' });

    await q.destroy();
    await logAction(req.user.id, 'DELETE', 'QuestionBank', `Deleted question ID ${req.params.id}`);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────────────
// AUDIT LOGS
// ──────────────────────────────────────────────────────

// @route   GET /api/admin/logs
// @desc    Get the 100 most recent audit log entries, with admin name/email
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'AdminUser', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 100 // Safety cap to prevent response overflow
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 3.2 TPO Controller (`backend/controllers/tpoController.js`)

**Routes prefix:** `/api/tpo/`
**Access:** `role: TPO`
**Purpose:** The TPO controller provides coordinated oversight capabilities — viewing analytics, approving companies, launching drives, tracking student readiness, sending broadcast emails, and exporting CSV reports.

### Full Source Code
```javascript
const { PlacementDrive, CompanyProfile, StudentProfile, User, Notification, TestResult, MockSession, sequelize } = require('../models');
const { Op } = require('sequelize');
const sendEmail = require('../utils/emailService');

// @route   GET /api/tpo/analytics
// @desc    Get placement analytics: active drives, average CTC, student count
exports.getAnalytics = async (req, res) => {
  try {
    const stats = await Promise.all([
      PlacementDrive.count({ where: { status: 'Ongoing' } }),
      // SQL AVG aggregate function via Sequelize
      PlacementDrive.findAll({
        attributes: [[sequelize.fn('AVG', sequelize.col('package_lpa')), 'avgCTC']],
        raw: true
      }),
      StudentProfile.count()
    ]);

    res.json({
      success: true,
      data: {
        activeDrives: stats[0],
        avgCTC: parseFloat(stats[1][0]?.avgCTC || 0).toFixed(2),
        totalTracked: stats[2]
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @route   GET /api/tpo/companies
// @desc    Get all company profiles for verification review
exports.getCompanyVerifications = async (req, res) => {
  try {
    const companies = await CompanyProfile.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: companies });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @route   PUT /api/tpo/companies/:id/approve
// @desc    Grant is_verified status to a company profile
exports.approveCompany = async (req, res) => {
  try {
    const company = await CompanyProfile.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Entity not found' });

    company.is_verified = true;
    await company.save();
    res.json({ success: true, message: 'Verification privileges granted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @route   POST /api/tpo/drives
// @desc    Create and launch a new Placement Drive
exports.launchDrive = async (req, res) => {
  try {
    const { companyId, job_role, description, eligibility_cgpa, eligibility_branch, package_lpa, drive_date } = req.body;
    const newDrive = await PlacementDrive.create({
      companyId, job_role, description,
      eligibility_cgpa, eligibility_branch,
      package_lpa, drive_date, status: 'Upcoming'
    });
    res.status(201).json({ success: true, data: newDrive });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// @route   GET /api/tpo/tracker
// @desc    Aggregate student profiles with their test and mock interview scores
exports.getReadinessTracker = async (req, res) => {
  try {
    // Multi-table SQL JOIN to aggregate all student activity
    const students = await StudentProfile.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: TestResult, attributes: ['score'] },
        { model: MockSession, attributes: ['overall_score'] }
      ],
      order: [['cgpa', 'DESC']] // Sort by highest CGPA first
    });
    res.json({ success: true, data: students });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @route   POST /api/tpo/broadcast
// @desc    Send in-app notifications + optional SMTP emails to all target students
exports.broadcastMessage = async (req, res) => {
  try {
    const { title, content, targetBranch, sendMailToggle } = req.body;

    // Target branch filtering
    const condition = targetBranch && targetBranch !== 'All' ? { branch: targetBranch } : {};
    const profiles = await StudentProfile.findAll({ where: condition, include: [User] });

    if (profiles.length === 0) {
      return res.status(404).json({ success: false, message: 'No students match target branch' });
    }

    // Parallel dispatch using Promise.all for maximum throughput
    const promises = profiles.map(async (student) => {
      // 1. In-app Notification (database write)
      await Notification.create({
        userId: student.User.id,
        title: `[TPO BROADCAST] ${title}`,
        message: content,
        type: 'Info'
      });

      // 2. SMTP Email (optional, non-blocking)
      if (sendMailToggle && student.User.email) {
        try {
          await sendEmail({
            email: student.User.email,
            subject: `CRITICAL UPDATE: ${title}`,
            message: content,
            html: `<div style="font-family: sans-serif; padding: 20px; border-left: 4px solid #1e3a8a;">
                     <h2 style="color: #1e3a8a;">TPO Office Broadcast</h2>
                     <p>${content}</p>
                   </div>`
          });
        } catch (mailErr) {
          console.error(`Mail bounce to ${student.User.email}:`, mailErr.message);
        }
      }
    });

    await Promise.all(promises);
    res.json({ success: true, message: `Dispatched to ${profiles.length} endpoints.` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @route   GET /api/tpo/export
// @desc    Export all student data as a downloadable CSV file
exports.exportReport = async (req, res) => {
  try {
    const data = await StudentProfile.findAll({ include: [User] });

    // Manual CSV string construction (no external library needed)
    let csv = "Name,Email,Branch,CGPA,Location\n";
    data.forEach(p => {
      csv += `"${p.User.name}","${p.User.email}","${p.branch}","${p.cgpa}","${p.location || ''}"\n`;
    });

    // Force browser download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_report.csv');
    res.status(200).send(csv);
  } catch (e) {
    res.status(500).send("Export failed");
  }
};
```

---

## 3.3 Test Controller (`backend/controllers/testController.js`)

**Routes prefix:** `/api/tests/`
**Purpose:** Manages the entire aptitude test lifecycle — from AI-powered dynamic question generation to result recording.

### Full Source Code
```javascript
const { AptitudeTest, QuestionBank, TestQuestion, TestResult, StudentProfile } = require('../models');
const { generateAptitudeQuestions } = require('../utils/aiService');
const fs = require('fs');
const path = require('path');

// @route   GET /api/tests
// @desc    Fetch all available tests
exports.getTests = async (req, res) => {
  try {
    const tests = await AptitudeTest.findAll();
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/tests/:id/submit
// @desc    Record a student's test result
exports.submitTest = async (req, res) => {
  try {
    const { score, accuracy_percentage } = req.body;
    const student = await StudentProfile.findOne({ where: { userId: req.user.id } });

    const result = await TestResult.create({
      studentId: student.id,
      testId: req.params.id,
      score,
      accuracy_percentage
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/tests/generate
// @desc    Generate an AI aptitude test dynamically using Gemini
exports.generateAIGeneratedTest = async (req, res) => {
  try {
    const { domain, count } = req.body;

    // Call Gemini AI to generate MCQ questions
    const questions = await generateAptitudeQuestions(domain, count || 5);

    // Create an AptitudeTest record in the database
    const test = await AptitudeTest.create({
      title: `AI Test: ${domain}`,
      duration_minutes: (count || 5) * 2,  // 2 mins per question
      total_marks: (count || 5) * 10        // 10 marks per question
    });

    // Persist each AI-generated question into QuestionBank and link to test
    for (const q of questions) {
      const dbQuestion = await QuestionBank.create({
        domain: domain,
        topic: 'AI Generated',
        difficulty: 'Medium',
        question_text: q.question,
        options: q.options,           // JSON array stored directly
        correct_option: q.correct     // Plain text correct answer string
      });
      await test.addQuestionBank(dbQuestion); // Many:Many junction link
    }

    // Return generated questions to frontend in real-time
    res.status(201).json({ success: true, testId: test.id, data: questions });
  } catch (error) {
    // Crash debugging: write error to disk log file
    const logMessage = `[${new Date().toISOString()}] Test generation failed.\nError: ${error.message}\nStack: ${error.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, '..', 'debug_test.log'), logMessage);

    res.status(500).json({ success: false, message: error.message || 'Server Error during test generation' });
  }
};
```

### The AI Test Generation Flow (End-to-End)
```
Frontend (AptitudeTest.jsx)
    │
    │  POST /api/tests/generate { domain: "React.js", count: 5 }
    ▼
testController.generateAIGeneratedTest()
    │
    │  Calls aiService.generateAptitudeQuestions("React.js", 5)
    ▼
Gemini API (gemini-flash-latest)
    │  Returns JSON: [{question, options, correct}, ...]
    ▼
testController (back)
    │  Creates AptitudeTest record in DB
    │  Saves each question to QuestionBank
    │  Links them via TestQuestion junction table
    ▼
Frontend receives questions array
    │  Renders interactive MCQ UI
    │  User answers all 5 questions
    │
    │  POST /api/tests/:testId/submit { score, accuracy_percentage }
    ▼
testController.submitTest()
    │  Writes TestResult to DB (linked to StudentProfile)
    ▼
Score appears in Student Dashboard & PDF Resume
```
