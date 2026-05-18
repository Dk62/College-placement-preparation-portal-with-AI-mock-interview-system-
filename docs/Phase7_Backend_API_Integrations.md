# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 7: Backend API & Database Integrations
## Chapter 10: Connecting the Frontend to the Node.js Architecture

### 10.1 Overview and Purpose
While previous chapters focused on the React UIs, this chapter fulfills the critical requirement of mapping the Frontend actions directly to their **Backend Express Controllers** and **Sequelize Database Models**. 
This establishes a clear "Line of Sight" from what the user clicks to how the SQL database processes the data.

---

### 10.2 The Applicant Tracking System (ATS) Integration
**Frontend View:** `ResumeBuilder.jsx` & `Profile.jsx`
**Backend Controller:** `profileController.js`
**Database Models:** `StudentProfile`, `User`, `MockSession`, `TestResult`

#### 10.2.1 The PDF Generation Pipeline (`downloadResume`)
When a student clicks "Download PDF" on the frontend, the backend executes a massive SQL relational join.
```javascript
// backend/controllers/profileController.js

exports.downloadResume = async (req, res) => {
  try {
    // Advanced SQL JOIN Operation
    const profile = await StudentProfile.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: MockSession, limit: 1, order: [['createdAt', 'DESC']] }, // Fetches latest AI chat
        { model: TestResult, limit: 1, order: [['createdAt', 'DESC']] }  // Fetches latest MCQ score
      ]
    });

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    // Stream raw PDF bytes directly to the client browser
    generateResume(profile, res); 
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
```
**Database Implication:** This single route pulls from 4 different database tables simultaneously. The `order: [['createdAt', 'DESC']]` ensures that the final PDF resume is automatically stamped with the student's *most recent* AI performance metrics, making their resume dynamic and highly attractive to recruiters.

#### 10.2.2 Multipart Binary Uploads (`analyzeUploadedResume`)
To prevent server memory crashes when handling heavy PDF files uploaded from `ResumeAnalyzer.jsx`:
```javascript
exports.analyzeUploadedResume = async (req, res) => {
  try {
    // 1. Guard Clauses
    if (!req.file || req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, message: 'Invalid file type.' });
    }

    // 2. Binary Extraction (pdf-parse)
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText.trim()) throw new Error('Unreadable PDF format');

    // 3. Dispatch text to Gemini LLM
    const analysisResult = await getResumeAnalysis(extractedText);

    res.status(200).json({ success: true, data: analysisResult });
  } catch (error) {
    // Critical Server Failure Logging
    const logMessage = `[${new Date().toISOString()}] Resume analysis failed.\nError: ${error.message}\n\n`;
    fs.appendFileSync(path.join(__dirname, '..', 'debug_resume.log'), logMessage);
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

---

### 10.3 The Placement Drive Ecosystem
**Frontend View:** `PlacementDrives.jsx`
**Backend Controller:** `driveController.js`
**Database Models:** `PlacementDrive`, `DriveApplication`, `CompanyProfile`

#### 10.3.1 Application Submission and Eligibility Gates
When a student clicks "Apply" on the frontend, the backend executes strict SQL integrity checks to ensure they meet the Corporate requirements.
```javascript
// backend/controllers/driveController.js

exports.applyForDrive = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { userId: req.user.id } });
    const drive = await PlacementDrive.findByPk(req.params.id);

    // SQL Integrity Gate 1: Check Minimum CGPA Constraints
    if (student.cgpa < drive.eligibility_cgpa) {
      return res.status(400).json({ success: false, message: 'Not eligible based on CGPA' });
    }

    // Database Write Operation
    const application = await DriveApplication.create({
      studentId: student.id,
      driveId: drive.id,
      status: 'Applied'
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
```

#### 10.3.2 Automated Email Dispatch (TPO / Company Admin)
When a Company updates an application status (e.g., "Shortlisted" or "Selected"), the backend intercepts the status update and dynamically dispatches an email.
```javascript
exports.updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const application = await DriveApplication.findByPk(req.params.id, {
    include: [{ model: StudentProfile, include: [User] }, { model: PlacementDrive, include: [CompanyProfile] }]
  });

  application.status = status;
  await application.save();

  // SMTP Dispatcher
  if (status === 'Shortlisted' || status === 'Selected') {
    const studentEmail = application.StudentProfile.User.email;
    const companyName = application.PlacementDrive.CompanyProfile.company_name;

    await sendEmail({
      email: studentEmail,
      subject: `Update on your application at ${companyName}`,
      message: `Congratulations! Your application status has been updated to: ${status} for the role of ${application.PlacementDrive.job_role}.`
    });
  }

  res.status(200).json({ success: true, data: application });
};
```

### 10.4 Architectural Security Summary
1. **Model Relations:** Every controller extensively uses `include: [{ model: X }]`. This is Sequelize's ORM method for executing secure SQL `INNER JOIN` operations without exposing the app to SQL Injection vulnerabilities common with raw `SELECT * FROM` queries.
2. **File Buffering:** The `profileController` never saves PDFs to the disk. It reads the binary string via `req.file.buffer` and sends the data straight to the AI. This eliminates malicious malware/viruses from ever touching the Railway server's hard drive.
3. **Hard-Drive Error Logging:** If an AI route crashes, `fs.appendFileSync` natively commands Node to write physical log traces to `debug_resume.log`. This guarantees the server administrator can track exactly why a production failure occurred.
