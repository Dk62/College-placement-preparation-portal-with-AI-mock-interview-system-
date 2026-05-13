const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getOwnDrives,
  postDrive,
  getDriveApplications,
  updateAppStatus,
  generateOffer
} = require('../controllers/companyController');

// Strict locks for 'Company' role only
router.use(protect);
router.use(authorize('Company'));

// Profile handling
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Lifecycle Handling
router.get('/drives', getOwnDrives);
router.post('/drives', postDrive);

// ATS handling
router.get('/drives/:driveId/applications', getDriveApplications);
router.put('/applications/:id/status', updateAppStatus);

// Synthesis logic
router.get('/applications/:id/offer', generateOffer);

module.exports = router;
