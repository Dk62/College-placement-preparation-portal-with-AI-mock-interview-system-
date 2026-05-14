const express = require('express');
const { 
  getMyProfile, 
  updateStudentProfile, 
  downloadResume, 
  analyzeResume, 
  analyzeUploadedResume,
  uploadAvatar 
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer memory storage with image constraints
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    // Safely accept images & pdfs
    if (file.fieldname === 'avatar' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload only image files.'), false);
    }
    cb(null, true);
  }
});

const router = express.Router();

router.use(protect);

router.get('/me', getMyProfile);
router.put('/student', authorize('Student'), updateStudentProfile);
router.get('/student/resume', authorize('Student'), downloadResume);
router.post('/student/analyze-resume', authorize('Student'), analyzeResume);
router.post('/student/analyze-upload', authorize('Student'), upload.single('resume'), analyzeUploadedResume);

// High-Speed Cloudinary Media Channel
router.post('/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
