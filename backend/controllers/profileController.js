const { StudentProfile, TPOProfile, CompanyProfile, User, MockSession, TestResult } = require('../models');
const { generateResume } = require('../utils/resumeGenerator');
const { getResumeAnalysis } = require('../utils/aiService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// @desc    Get current user's specific profile
// @route   GET /api/profiles/me
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    let profile;
    const role = req.user.role;

    if (role === 'Student') {
      profile = await StudentProfile.findOne({ where: { userId: req.user.id } });
    } else if (role === 'TPO') {
      profile = await TPOProfile.findOne({ where: { userId: req.user.id } });
    } else if (role === 'Company') {
      profile = await CompanyProfile.findOne({ where: { userId: req.user.id } });
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update student profile
// @route   PUT /api/profiles/student
// @access  Private (Student only)
exports.updateStudentProfile = async (req, res) => {
  try {
    const { 
      enrollment_no, branch, cgpa, resume_link, linkedin_link, 
      phone, github_link, location, degree, academic_year, current_semester,
      skills, experience, projects, certifications, objective,
      tenth_board, tenth_percent, tenth_year, twelfth_board, twelfth_percent, twelfth_year
    } = req.body;

    let profile = await StudentProfile.findOne({ where: { userId: req.user.id } });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const sanitizedCgpa = cgpa === '' ? null : cgpa;

    profile = await profile.update({
      enrollment_no, branch, cgpa: sanitizedCgpa, resume_link, linkedin_link,
      phone, github_link, location, degree, academic_year, current_semester,
      skills, experience, projects, certifications, objective,
      tenth_board, tenth_percent, tenth_year, twelfth_board, twelfth_percent, twelfth_year
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating student profile:', error.name, error.message);
    if (error.errors) {
      error.errors.forEach(e => console.error('Validation error:', e.message));
    }
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Generate PDF Resume
// @route   GET /api/profiles/student/resume
// @access  Private (Student only)
exports.downloadResume = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: MockSession, limit: 1, order: [['createdAt', 'DESC']] },
        { model: TestResult, limit: 1, order: [['createdAt', 'DESC']] }
      ]
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    generateResume(profile, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Analyze student resume with AI
// @route   POST /api/profiles/student/analyze-resume
// @access  Private (Student only)
exports.analyzeResume = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Prepare data for AI
    const resumeData = {
      name: profile.User?.name,
      email: profile.User?.email,
      branch: profile.branch,
      cgpa: profile.cgpa,
      skills: profile.skills || [],
      experience: profile.experience || [],
      projects: profile.projects || []
    };

    const analysisResult = await getResumeAnalysis(JSON.stringify(resumeData));

    res.status(200).json({ success: true, data: analysisResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error during resume analysis' });
  }
};

// @desc    Analyze uploaded PDF resume
// @route   POST /api/profiles/student/analyze-upload
// @access  Private (Student only)
exports.analyzeUploadedResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume file.' });
    }

    // Ensure it's a PDF (basic safety)
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, message: 'Invalid file type. Only PDF format is allowed.' });
    }

    // Extract text from the buffer
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract readable text from the uploaded PDF. Please make sure it is not a scanned image.' });
    }

    // Send exact extracted text to the Gemini analysis function
    const analysisResult = await getResumeAnalysis(extractedText);

    res.status(200).json({ success: true, data: analysisResult });
  } catch (error) {
    // Log detailed error to a local file for analysis
    const logMessage = `[${new Date().toISOString()}] Resume analysis failed.\nError Name: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, '..', 'debug_resume.log'), logMessage);
    
    console.error('Resume upload analysis failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during resume parsing and analysis' });
  }
};

// @desc    Upload user profile avatar
// @route   POST /api/profiles/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    // Locate existing user record to handle legacy cleanup
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    // If user already has an avatar on Cloudinary, delete it to prevent bloat
    if (user.profile_pic_public_id) {
      await deleteFromCloudinary(user.profile_pic_public_id);
    }

    // Dispatch buffer to Cloudinary
    const folderPath = `avatars/${user.role.toLowerCase()}`;
    const result = await uploadToCloudinary(req.file.buffer, folderPath);

    // Update Database record with permanent CDN links
    await user.update({
      profile_pic: result.secure_url,
      profile_pic_public_id: result.public_id
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully to cloud storage',
      url: result.secure_url
    });
  } catch (error) {
    console.error('Avatar Upload Error:', error);
    res.status(500).json({ success: false, message: 'Server Error during avatar uploading' });
  }
};

