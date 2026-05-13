const express = require('express');
const { getMyProfile, updateStudentProfile, downloadResume, analyzeResume, analyzeUploadedResume } = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer memory storage for quick PDF parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // limit size to 5MB
});

const router = express.Router();

router.use(protect);

router.get('/me', getMyProfile);
router.put('/student', authorize('Student'), updateStudentProfile);
router.get('/student/resume', authorize('Student'), downloadResume);
router.post('/student/analyze-resume', authorize('Student'), analyzeResume);
router.post('/student/analyze-upload', authorize('Student'), upload.single('resume'), analyzeUploadedResume);

module.exports = router;
