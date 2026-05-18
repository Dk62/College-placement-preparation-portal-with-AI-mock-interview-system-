# College Placement Preparation Portal
## Full Source Code Documentation — Volume 5
### Company, Mock Interview Controllers & Backend Utility Services

---

## 5.1 Company Controller (`backend/controllers/companyController.js`)

**Routes prefix:** `/api/company/`
**Access:** `role: Company` + TPO verification gate
**Purpose:** Provides the complete HR recruitment pipeline — managing company profiles, posting placement drives (with verification gate), tracking applicants, and generating official offer letters as PDFs.

### Full Source Code with Annotations
```javascript
const { CompanyProfile, PlacementDrive, DriveApplication, StudentProfile, User, Notification, sequelize } = require('../models');
const PDFDocument = require('pdfkit');

// ──────────────────────────────────────────────────────
// PROFILE MANAGEMENT
// ──────────────────────────────────────────────────────

// @route   GET /api/company/profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ where: { userId: req.user.id } });
    res.json({ success: true, data: profile });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// @route   PUT /api/company/profile
// @desc    Upsert logic: create profile if first time, update if exists
exports.updateProfile = async (req, res) => {
  try {
    const { company_name, description, website } = req.body;
    let profile = await CompanyProfile.findOne({ where: { userId: req.user.id } });
    
    // Auto-create on first update (upsert pattern)
    if (!profile) profile = await CompanyProfile.create({ userId: req.user.id, company_name });

    profile.company_name = company_name || profile.company_name;
    profile.description = description;
    profile.website = website;
    await profile.save();

    res.json({ success: true, message: 'Corporate profile saved.', data: profile });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ──────────────────────────────────────────────────────
// DRIVE MANAGEMENT
// ──────────────────────────────────────────────────────

// @route   GET /api/company/drives
exports.getOwnDrives = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile missing' });

    const drives = await PlacementDrive.findAll({
      where: { companyId: profile.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: drives });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// @route   POST /api/company/drives
// @desc    Only verified companies can post drives (TPO verification required)
exports.postDrive = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ where: { userId: req.user.id } });
    
    // CRITICAL: Hard security gate — unverified companies cannot post drives
    if (!profile?.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'UNAUTHORIZED: Profile requires TPO verification before launches.'
      });
    }

    const drive = await PlacementDrive.create({
      ...req.body,
      companyId: profile.id,
      status: 'Upcoming'
    });
    res.status(201).json({ success: true, data: drive });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

// ──────────────────────────────────────────────────────
// APPLICANT TRACKING SYSTEM (ATS)
// ──────────────────────────────────────────────────────

// @route   GET /api/company/drives/:driveId/applications
// @desc    Get all applicants for a specific drive with student details
exports.getDriveApplications = async (req, res) => {
  try {
    const { driveId } = req.params;
    const apps = await DriveApplication.findAll({
      where: { driveId },
      include: [{
        model: StudentProfile,
        include: [{ model: User, attributes: ['name', 'email'] }] // Never expose password
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: apps });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// @route   PUT /api/company/applications/:id
// @desc    Update application status with DB transaction + in-app notification
exports.updateAppStatus = async (req, res) => {
  // Use a transaction to ensure both status update AND notification creation
  // succeed atomically, or both rollback if either fails
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Shortlisted', 'Selected', 'Rejected'

    const app = await DriveApplication.findByPk(id, {
      include: [
        { model: PlacementDrive, include: [CompanyProfile] },
        { model: StudentProfile, include: [User] }
      ],
      transaction: t
    });

    if (!app) throw new Error('Application node not found.');

    app.status = status;
    await app.save({ transaction: t });

    // Simultaneous notification creation (within same transaction)
    await Notification.create({
      userId: app.StudentProfile.User.id,
      title: `Application Status: ${app.PlacementDrive.CompanyProfile.company_name}`,
      message: `Your candidature for ${app.PlacementDrive.job_role} has transitioned to: ${status}.`,
      type: 'Alert'
    }, { transaction: t });

    await t.commit(); // Finalize both operations together
    res.json({ success: true, message: `Candidature progressed to ${status}` });
  } catch (e) {
    await t.rollback(); // Undo everything if anything failed
    res.status(500).json({ success: false, message: e.message });
  }
};

// ──────────────────────────────────────────────────────
// OFFER LETTER GENERATION (PDF)
// ──────────────────────────────────────────────────────

// @route   GET /api/company/applications/:id/offer
// @desc    Programmatically generate a personalized PDF offer letter
exports.generateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await DriveApplication.findByPk(id, {
      include: [
        { model: PlacementDrive, include: [CompanyProfile] },
        { model: StudentProfile, include: [User] }
      ]
    });

    // Status guard: only 'Selected' candidates can receive offer letters
    if (!app || app.status !== 'Selected') {
      return res.status(400).send("Cannot generate offers unless candidate is formally 'Selected'.");
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Offer_${app.StudentProfile.User.name.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // PDF Content
    doc.fillColor('#1e3a8a').fontSize(24).text('LETTER OF INTENT / OFFER', { align: 'center' });
    doc.moveDown();
    doc.fillColor('#000').fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);
    doc.text(`Dear ${app.StudentProfile.User.name.split(' ')[0]},`);
    doc.moveDown();
    doc.text(`Following your evaluation process, we are pleased to extend an offer for the position of ${app.PlacementDrive.job_role}.`);
    doc.moveDown();
    doc.text(`Proposed CTC: ${app.PlacementDrive.package_lpa} LPA`);
    doc.moveDown(4);
    doc.text(`Sincerely,`);
    doc.moveDown();
    doc.fontSize(14).fillColor('#1e3a8a').text(`${app.PlacementDrive.CompanyProfile.company_name}`);

    doc.end();
  } catch (e) { res.status(500).send("PDF Synthesis failure: " + e.message); }
};
```

### ACID Transaction Pattern in `updateAppStatus`
```
START TRANSACTION
    │
    ├─ UPDATE DriveApplication SET status = 'Selected' WHERE id = ?  ✓
    ├─ INSERT INTO Notifications (userId, message, type) VALUES (...)  ✓
    │
COMMIT  ← Both happen together
    │
    OR
    │
ROLLBACK ← If EITHER fails, neither is saved
```
This prevents scenarios where a student's status changes but they never receive their notification (or vice versa), guaranteeing data consistency.

---

## 5.2 Mock Interview Controller (`backend/controllers/mockController.js`)

**Routes prefix:** `/api/mock/`
**Purpose:** Manages the full 3-phase AI interview lifecycle: session creation, real-time answer evaluation, and session completion with score averaging.

### Full Source Code
```javascript
const { MockSession, MockResponse, StudentProfile } = require('../models');
const { getMockInterviewResponse } = require('../utils/aiService');

// @route   POST /api/mock/sessions
// @desc    Phase 1: Start a new AI mock interview session
exports.startSession = async (req, res) => {
  try {
    const { domain } = req.body;
    const student = await StudentProfile.findOne({ where: { userId: req.user.id } });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Create the session record (score = null until Phase 3 completes it)
    const session = await MockSession.create({
      studentId: student.id,
      domain
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/mock/sessions/:sessionId/responses
// @desc    Phase 2: Submit answer, receive real-time AI grading
exports.submitResponse = async (req, res) => {
  try {
    const { question, student_answer } = req.body;
    const { sessionId } = req.params;

    const session = await MockSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Send to Gemini for evaluation
    const aiEvaluation = await getMockInterviewResponse(session.domain, question, student_answer);

    // Persist the graded response
    const mockResponse = await MockResponse.create({
      sessionId,
      question,
      student_answer,
      ai_feedback: aiEvaluation.ai_feedback,         // Gemini's text feedback
      correctness_score: aiEvaluation.correctness_score // Gemini's numeric score 0-100
    });

    res.status(201).json({ success: true, data: mockResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   PUT /api/mock/sessions/:sessionId/complete
// @desc    Phase 3: Average all response scores → finalize session record
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Load session WITH all its child responses for averaging
    const session = await MockSession.findByPk(sessionId, {
      include: [MockResponse]
    });

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const responses = session.MockResponses || [];
    if (responses.length === 0) {
      return res.status(400).json({ success: false, message: 'No responses found in this session' });
    }

    // Mathematical average of all correctness_score values
    const totalScore = responses.reduce((acc, curr) => acc + (curr.correctness_score || 0), 0);
    const overall_score = totalScore / responses.length;

    // Write final metrics back to the session record
    session.overall_score = overall_score;
    session.feedback_summary = `Session completed with an average score of ${overall_score.toFixed(2)}%`;
    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
```

---

## 5.3 Email Service (`backend/utils/emailService.js`)

**Library:** `nodemailer`
**Supported Providers:** Gmail SMTP (default), configurable via `.env`
**Purpose:** A reusable async function for sending transactional emails — OTP recovery codes, application status updates, TPO broadcast messages.

### Full Source Code
```javascript
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Defensive sanitization: Google App Passwords often have spaces in their display form
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASSWORD?.replace(/\s+/g, '').trim();
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  // Create a fresh transporter for each email (stateless design)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpPort === 465, // true for SSL/465, false for STARTTLS/587
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false // Bypass self-signed cert errors in local dev
    }
  });

  const message = {
    from: `"AI Placement Recovery" <${smtpUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,        // Plaintext fallback
    html: options.html,           // Styled HTML version (shown in modern email clients)
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
```

### Required `.env` Variables for Email
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASSWORD=your_16_char_google_app_password
```

---

## 5.4 Cloudinary Media Service (`backend/utils/cloudinaryService.js`)

**Library:** `cloudinary` v2
**Purpose:** Handles all binary media uploads (profile avatars) to the Cloudinary CDN. Uses streaming uploads directly from RAM buffers — no temporary disk files are ever created.

### Full Source Code
```javascript
const cloudinary = require('../config/cloudinary');

/**
 * Uploads a RAM buffer (from Multer memoryStorage) directly to Cloudinary.
 * @param {Buffer} fileBuffer - req.file.buffer from Multer
 * @param {String} folderName - Destination folder within Cloudinary vault
 * @returns {Promise} - Resolves with { secure_url, public_id, ... }
 */
exports.uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    // Create a streaming upload channel
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `placement_portal/${folderName}`,
        resource_type: 'auto' // Auto-detect: image, pdf, video, raw
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Stream Error:', error);
          return reject(error);
        }
        resolve(result); // result.secure_url + result.public_id
      }
    );

    // Write buffer into the stream and signal end-of-data
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes a media asset from Cloudinary by its unique public_id.
 * Called before uploading a new avatar to prevent storage bloat.
 * @param {String} publicId - The asset's unique Cloudinary identifier
 */
exports.deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary Asset Deletion Error:', error);
    throw error;
  }
};
```

### Avatar Upload Flow (End-to-End)
```
Frontend (Settings.jsx or Profile.jsx)
    │  POST /api/profiles/avatar (multipart/form-data)
    ▼
Multer Middleware
    │  Stores file in RAM: req.file.buffer (never touches disk)
    ▼
profileController.uploadAvatar()
    │  1. Finds the user in DB
    │  2. If old avatar exists: deleteFromCloudinary(user.profile_pic_public_id)
    │  3. Calls uploadToCloudinary(req.file.buffer, 'avatars/student')
    ▼
Cloudinary CDN
    │  Returns { secure_url: "https://res.cloudinary.com/...", public_id: "avatars/..." }
    ▼
profileController (back)
    │  Updates User.profile_pic = secure_url
    │  Updates User.profile_pic_public_id = public_id
    ▼
Frontend receives { url: "https://..." }
    │  Updates displayed avatar immediately
```
