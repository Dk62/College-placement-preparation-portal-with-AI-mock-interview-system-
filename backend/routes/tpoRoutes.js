const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAnalytics,
  getCompanyVerifications,
  approveCompany,
  launchDrive,
  getReadinessTracker,
  broadcastMessage,
  exportReport
} = require('../controllers/tpoController');

// Enforce global gatekeepers
router.use(protect);
router.use(authorize('TPO', 'Admin')); // Allow admin overflow just in case

// Definitions
router.get('/analytics', getAnalytics);
router.get('/companies', getCompanyVerifications);
router.put('/companies/:id/approve', approveCompany);

router.post('/drives', launchDrive);
router.get('/students/readiness', getReadinessTracker);
router.post('/broadcast', broadcastMessage);

router.get('/export', exportReport);

module.exports = router;
