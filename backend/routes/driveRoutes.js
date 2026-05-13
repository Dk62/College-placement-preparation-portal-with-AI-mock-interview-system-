const express = require('express');
const { getDrives, createDrive, applyForDrive, updateApplicationStatus } = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDrives)
  .post(authorize('TPO', 'Company', 'Admin'), createDrive);

router.post('/:id/apply', authorize('Student'), applyForDrive);

router.put('/applications/:id', authorize('TPO', 'Company', 'Admin'), updateApplicationStatus);

module.exports = router;
